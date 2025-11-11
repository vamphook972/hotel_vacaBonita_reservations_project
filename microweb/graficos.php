<?php

$baseDir = __DIR__ . '/dataset/resultados_proyecto';

// Verificar existencia
$csvFiles = [];
if ($baseDir && is_dir($baseDir)) {
    // Iterador recursivo que salta . y .. y sigue subcarpetas
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($baseDir, FilesystemIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );

    foreach ($it as $fileInfo) {
        if ($fileInfo->isFile()) {
            $filename = $fileInfo->getFilename();
            // extensión .csv (case-insensitive)
            if (preg_match('/\.csv$/i', $filename)) {
                // Guarda la ruta absoluta
                $csvFiles[] = $fileInfo->getPathname();
            }
        }
    }
}

// Ordenar archivos por ruta para orden predecible
sort($csvFiles, SORT_NATURAL | SORT_FLAG_CASE);

// Parser de CSV (igual lógica que tenías, con ligeros refuerzos)
function parse_csv($path) {
    // abrir en modo binario para evitar problemas con encoding
    $handle = @fopen($path, 'rb');
    if (!$handle) return null;

    // Intentar detectar BOM y/o convertir a UTF-8 si es necesario (simple)
    // NOTA: si tus CSV ya están en UTF-8 esto se puede omitir.

    // Leer header (si existe)
    $header = fgetcsv($handle);
    $rows = [];
    while (($r = fgetcsv($handle)) !== false) {
        // Ignorar filas vacías
        $isEmpty = true;
        foreach ($r as $c) { if (trim($c) !== '') { $isEmpty = false; break; } }
        if ($isEmpty) continue;
        $rows[] = $r;
    }
    fclose($handle);
    if (empty($rows)) return null;

    // Construir labels y valores
    $labels = [];
    $values = [];
    foreach ($rows as $r) {
        $label = isset($r[0]) ? $r[0] : '';
        $labels[] = $label;

        $val = null;
        for ($i = 1; $i < count($r); $i++) {
            $candidate = str_replace(',', '.', $r[$i]);
            if (is_numeric($candidate)) {
                $val = (float)$candidate;
                break;
            }
        }
        if ($val === null) {
            if (count($r) === 1 && is_numeric(str_replace(',', '.', $r[0]))) {
                $val = (float)str_replace(',', '.', $r[0]);
            } else {
                $last = $r[count($r)-1];
                $lastn = str_replace(',', '.', $last);
                $val = is_numeric($lastn) ? (float)$lastn : null;
            }
        }
        $values[] = $val;
    }

    // Si todas las labels vacías (caso de valor único), ponemos label genérico
    $allEmptyLabels = true;
    foreach ($labels as $l) { if (trim($l) !== '') { $allEmptyLabels = false; break; } }
    if ($allEmptyLabels) {
        // etiqueta por defecto será el nombre del archivo (sin extension)
        $labels = [ 'value' ];
    }

    return [
        'path' => $path,
        'name' => basename($path),
        'header' => $header,
        'labels' => $labels,
        'values' => $values
    ];
}

// Procesar todos los CSV encontrados
$data = [];
foreach ($csvFiles as $f) {
    $parsed = parse_csv($f);
    if ($parsed) $data[] = $parsed;
}

// Convertir a JSON para enviar al frontend (escape seguro)
$json = htmlspecialchars(json_encode($data, JSON_UNESCAPED_UNICODE), ENT_QUOTES, 'UTF-8');

// Para mostrar rutas relativas más limpias en la UI
$baseReal = realpath($baseDir) ?: $baseDir;
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
        code{background:#f1f5f9;padding:2px 6px;border-radius:4px}
    </style>
</head>
<body>
<div class="wrap">
    <header>
        <h1>Gráficas desde CSV - <?php echo htmlspecialchars($baseReal) ?></h1>
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
        <div class="card"><p>No se encontraron CSV en <code><?php echo htmlspecialchars($baseReal) ?></code></p></div>
    <?php else: ?>
        <div class="grid" id="chartsGrid">
            <?php foreach ($data as $idx => $d):
                $id = 'chart_' . $idx;
                $displayName = htmlspecialchars($d['name']);
                // calcular ruta relativa para mostrar
                $relpath = $d['path'];
                if (strpos($relpath, $baseReal) === 0) {
                    $relpath = ltrim(substr($relpath, strlen($baseReal)), '/\\');
                }
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
                <div class="meta">Ruta: <code><?php echo htmlspecialchars($relpath) ?></code></div>
            </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<script>
const datasets = <?php echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>;

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
    const charts = [];
    datasets.forEach((d, idx) => {
        const canvasId = 'chart_' + idx;
        const ctx = document.getElementById(canvasId).getContext('2d');

        let labels = d.labels;
        let values = d.values.map(v => (v === null ? 0 : v));

        if (labels.length === 1 && (labels[0] === '' || labels[0] === 'value')) {
            labels = [d.name.replace(/\.csv$/i,'')];
        }

        let chosen = (labels.length <= 6) ? 'pie' : 'bar';
        chosen = defaultTypeSelect.value || chosen;
        const cfg = createCfg(chosen, labels, values, d.name.replace(/\.csv$/i,''));
        charts[idx] = new Chart(ctx, cfg);

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