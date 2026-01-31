# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /workspace

COPY pom.xml .
COPY src ./src

RUN mvn -q -DskipTests package

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /workspace/target/SpringEcommerceApp-1.0-SNAPSHOT.jar /app/app.jar

# Optional CA certificates for database SSL
COPY certs /app/certs

# Import Aiven CA into JVM truststore if provided
RUN if [ -f /app/certs/aiven-ca.pem ]; then \
			keytool -importcert -noprompt -alias aiven-ca -file /app/certs/aiven-ca.pem \
				-keystore "$JAVA_HOME/lib/security/cacerts" -storepass changeit; \
		fi

ENV JAVA_OPTS=""
EXPOSE 8080

CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
