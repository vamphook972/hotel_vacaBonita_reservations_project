<?php
// Lee recursivamente CSV en dataset/resultados_proyecto
$baseDir = realpath(__DIR__ . '/../dataset/resultados_proyecto');
$csvFiles = [];
if ($baseDir && is_dir($baseDir)) {
    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($baseDir));
    foreach ($it as $f) {
        if ($f->isFile() && preg_match('/\.csv$/i', $f->getFilename())) {
            $csvFiles[] = $f->getPathname();
        }
    }
}
sort($csvFiles);

// Parseador flexible: usa la primera columna como labels y la primera columna numérica (después de la label) como valores.
// Si el CSV solo tiene un valor numérico en total, lo muestra como un único punto.
function parse_csv($path) {
    $handle = @fopen($path, 'r');
    if (!$handle) return null;
    $header = fgetcsv($handle);
    $rows = [];
    while (($r = fgetcsv($handle)) !== false) {
        // Ignorar filas vacías
        if (count($r) === 1 && trim($r[0]) === '') continue;
        $rows[] = $r;
    }
    fclose($handle);
    if (empty($rows)) return null;

    // Decide labels y valores
    $labels = [];
    $values = [];
    foreach ($rows as $r) {
        // label: columna 0 por defecto
        $label = isset($r[0]) ? $r[0] : '';
        $labels[] = $label;

        // buscar primer valor numérico en columnas después de la 0
        $val = null;
        for ($i = 1; $i < count($r); $i++) {
            $candidate = str_replace(',', '.', $r[$i]);
            if (is_numeric($candidate)) { $val = (float)$candidate; break; }
        }
        // Si no hay columna numérica y la fila tiene una sola columna numérica (ej archivos de un solo valor)
        if ($val === null) {
            // si solo existe una columna y es numérica
            if (count($r) === 1 && is_numeric(str_replace(',', '.', $r[0]))) {
                $val = (float)str_replace(',', '.', $r[0]);
                // label será el nombre del archivo para este caso; se ajustará después
            } else {
                // intentar última columna como fallback (si es numérica)
                $last = end($r);
                $lastn = str_replace(',', '.', $last);
                $val = is_numeric($lastn) ? (float)$lastn : null;
            }
        }
        $values[] = $val;
    }

    // Si todas las labels están vacías (casos de 1 valor), construir label único
    $allEmptyLabels = array_reduce($labels, fn($acc,$x)=> $acc && (trim($x)===''), true);
    if ($allEmptyLabels) {
        $labels = ['value'];
    }

    return [
        'path' => $path,
        'name' => basename($path),
        'header' => $header,
        'labels' => $labels,
        'values' => $values
    ];
}

$data = [];
foreach ($csvFiles as $f) {
    $parsed = parse_csv($f);
    if ($parsed) {
        $data[] = $parsed;
    }
}

$json = htmlspecialchars(json_encode($data, JSON_UNESCAPED_UNICODE), ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Dashboard - Gráficas CSV</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body{font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;margin:0;padding:20px}
        .wrap{max-width:1200px;margin:auto}
        header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
        h1{font-size:20px;margin:0}
        .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px}
        .card{background:#fff;padding:12px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.06)}
        .card h3{font-size:14px;margin:0 0 8px 0}
        canvas{width:100%!important;height:260px!important}
        .meta{font-size:12px;color:#666;margin-top:8px}
        .type-select{float:right}
    </style>
</head>
<body>
<div class="wrap">
    <header>
        <h1>Gráficas desde CSV - dataset/resultados_proyecto</h1>
        <div>
            <label>Tipo por defecto:
                <select id="defaultType">
                    <option value="bar">Barras</option>
                    <option value="line">Línea</option>
                    <option value="pie">Torta</option>
                </select>
            </label>
        </div>
    </header>

    <?php if (empty($data)): ?>
        <div class="card"><p>No se encontraron CSV en <code><?php echo htmlspecialchars($baseDir) ?></code></p></div>
    <?php else: ?>
        <div class="grid" id="chartsGrid">
            <?php foreach ($data as $idx => $d): 
                $id = 'chart_' . $idx;
                $displayName = htmlspecialchars($d['name']);
                $relpath = htmlspecialchars(str_replace(realpath(__DIR__ . '/..') . DIRECTORY_SEPARATOR, '', $d['path']));
            ?>
            <div class="card">
                <div style="display:flex;align-items:center;justify-content:space-between">
                    <h3><?php echo $displayName ?></h3>
                    <select class="type-select" data-target="<?php echo $id ?>">
                        <option value="bar">Barras</option>
                        <option value="line">Línea</option>
                        <option value="pie">Torta</option>
                    </select>
                </div>
                <canvas id="<?php echo $id ?>"></canvas>
                <div class="meta">Ruta: <?php echo $relpath ?></div>
            </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<script>
const datasets = JSON.parse('<?php echo $json ?>');

// colores reutilizables
const defaultColors = [
    '#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#ec4899','#06b6d4','#f97316',
    '#84cc16','#14b8a6','#6366f1','#f43f5e'
];

function createCfg(type, labels, values, title) {
    return {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                label: title,
                data: values,
                backgroundColor: labels.map((_,i)=> defaultColors[i % defaultColors.length]),
                borderColor: '#111827',
                borderWidth: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: type !== 'bar' && type !== 'line' },
                title: { display: false }
            },
            scales: (type === 'pie') ? {} : { y: { beginAtZero: true } }
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    const defaultTypeSelect = document.getElementById('defaultType');
    // Crear charts
    const charts = [];
    datasets.forEach((d, idx) => {
        const canvasId = 'chart_' + idx;
        const ctx = document.getElementById(canvasId).getContext('2d');
        // si solo hay un value y no labels distintos, ajustar label
        let labels = d.labels;
        let values = d.values.map(v => (v === null ? 0 : v));
        if (labels.length === 1 && (labels[0] === '' || labels[0] === 'value')) {
            labels = [d.name.replace(/\.csv$/i,'')];
        }
        // elección de tipo por defecto: pie si <=6, bar si >6
        let chosen = (labels.length <= 6) ? 'pie' : 'bar';
        // permitir override global
        chosen = defaultTypeSelect.value || chosen;
        const cfg = createCfg(chosen, labels, values, d.name.replace(/\.csv$/i,''));
        charts[idx] = new Chart(ctx, cfg);

        // selector por tarjeta
        const sel = document.querySelector('select[data-target="' + canvasId + '"]');
        if (sel) {
            sel.value = chosen;
            sel.addEventListener('change', (e) => {
                charts[idx].destroy();
                charts[idx] = new Chart(ctx, createCfg(e.target.value, labels, values, d.name.replace(/\.csv$/i,'')));
            });
        }
    });

    defaultTypeSelect.addEventListener('change', () => {
        // recrear todos con tipo por defecto
        charts.forEach((c, i) => {
            const canvasId = 'chart_' + i;
            const sel = document.querySelector('select[data-target="' + canvasId + '"]');
            if (sel) {
                sel.value = defaultTypeSelect.value;
                sel.dispatchEvent(new Event('change'));
            }
        });
    });
});
</script>
</body>
</html>