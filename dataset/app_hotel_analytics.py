# app_hotel_analytics.py
import os
import glob
import shutil
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, round, avg

# Crear SparkSession con configuración más estable para escritura de archivos
spark = SparkSession.builder \
    .appName("Hotel Analytics") \
    .config("spark.hadoop.mapreduce.fileoutputcommitter.algorithm.version", "2") \
    .config("spark.speculation", "false") \
    .config("spark.hadoop.mapreduce.fileoutputcommitter.cleanup-failures.ignored", "true") \
    .getOrCreate()

# Cargar CSV original
df = spark.read.options(header=True, inferSchema=True) \
    .csv("/vagrant/dataset/hotel_analytics.csv")

# Función para guardar DataFrame temporalmente y renombrar CSV
def save_and_rename(df, folder, new_name):
    temp_output = f"/vagrant/dataset/resultados_proyecto/tmp_{folder}"
    final_output = f"/vagrant/dataset/resultados_proyecto/{folder}"

    df.coalesce(1).write.mode("overwrite").csv(temp_output, header=True)

    os.makedirs(final_output, exist_ok=True)

    file = glob.glob(f"{temp_output}/part-*.csv")[0]
    shutil.move(file, f"{final_output}/{new_name}.csv")

    shutil.rmtree(temp_output, ignore_errors=True)

# 1. Top 10 hoteles con más reseñas
top_hoteles = df.groupBy("hotel_name", "city", "country_y") \
    .count() \
    .orderBy("count", ascending=False) \
    .limit(10)
save_and_rename(top_hoteles, "p1", "top_hoteles_mas_reseñas")

# 2. Promedio de puntuación por tipo de viajero
prom_viajero = df.groupBy("traveller_type") \
    .agg(avg("score_overall").alias("promedio_score")) \
    .orderBy(col("promedio_score").desc()) \
    .limit(10)
save_and_rename(prom_viajero, "p2", "puntuacion_tipo_viajero")

# 3. Ciudades con mejor relación calidad/precio
mejor_valor = df.groupBy("city") \
    .agg(avg("score_value_for_money").alias("mejor_calidad_precio")) \
    .orderBy(col("mejor_calidad_precio").desc()) \
    .limit(10)
save_and_rename(mejor_valor, "p3", "mejor_valor")

# 4. Países con hoteles de 5 estrellas mejor puntuados
hoteles_5est = df.filter(df.star_rating == 5) \
    .groupBy("country_y") \
    .agg(avg("score_overall").alias("promedio_score")) \
    .orderBy(col("promedio_score").desc()) \
    .limit(10)
save_and_rename(hoteles_5est, "p4", "mejores_hoteles_5estrellas")

# 5. Hoteles con limpieza muy superior a la puntuación general
diff_clean = df.withColumn("diff_cleanliness", round(col("score_cleanliness") - col("score_overall"), 2)) \
    .dropDuplicates(["hotel_name"]) \
    .orderBy("diff_cleanliness", ascending=False) \
    .select("hotel_name", "city", "country_y", "diff_cleanliness") \
    .limit(20)
save_and_rename(diff_clean, "p5", "limpieza_vs_general")

# 6. Correlación entre limpieza y confort
correlation = df.stat.corr("score_cleanliness", "score_comfort")
corr_path = "/vagrant/dataset/resultados_proyecto/p6"
os.makedirs(corr_path, exist_ok=True)
with open(f"{corr_path}/correlacion_limpieza_confort.csv", "w") as f:
    f.write(f"correlacion_limpieza_confort\n{correlation}\n")

# 7. Países con mejor calificación por categoría de estrellas
paises_estrellas = df.groupBy("country_y", "star_rating") \
    .agg(avg("score_overall").alias("promedio_score")) \
    .orderBy(col("promedio_score").desc()) \
    .limit(20)
save_and_rename(paises_estrellas, "p7", "promedio_por_estrellas")

# 8. Ciudades con mejor atención del personal
mejor_staff = df.groupBy("city") \
    .agg(avg("score_staff").alias("promedio_staff")) \
    .orderBy(col("promedio_staff").desc()) \
    .limit(10)
save_and_rename(mejor_staff, "p8", "mejor_staff")

# 9. Países con hoteles mejor ubicados según los usuarios
mejor_ubicacion = df.groupBy("country_y") \
    .agg(avg("score_location").alias("promedio_ubicacion")) \
    .orderBy(col("promedio_ubicacion").desc()) \
    .limit(10)
save_and_rename(mejor_ubicacion, "p9", "mejor_ubicacion")
