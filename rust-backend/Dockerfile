FROM rust:1.70 as builder

WORKDIR /app
COPY . .

RUN cargo build --release

FROM debian:bullseye-slim
WORKDIR /app

COPY --from=builder /app/target/release/aura-backend /usr/local/bin
COPY config/prod.toml ./config/

EXPOSE 8080
CMD ["aura-backend"]
