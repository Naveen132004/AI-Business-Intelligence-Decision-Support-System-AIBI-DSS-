# ── Build ────────────────────────────────────────────────────────
# Official Gradle image (same version as the wrapper) so the build
# doesn't depend on downloading a Gradle distribution at build time.
FROM gradle:8.12-jdk21 AS build
WORKDIR /src

# Build scripts first so dependency downloads are cached
COPY settings.gradle build.gradle ./
RUN gradle --no-daemon dependencies > /dev/null

COPY src ./src
RUN gradle --no-daemon bootJar -x test \
 && cp build/libs/*-SNAPSHOT.jar /src/app.jar

# ── Run ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 10001 aibi
COPY --from=build /src/app.jar app.jar
USER aibi
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
