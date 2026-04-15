#!/usr/bin/env python3

from __future__ import annotations

import argparse
import os
import shlex
import subprocess
import sys


DEPLOY_ENV_CONFIG = {
    "staging": {
        "app_env": "staging",
        "image_tag": "staging",
        "container_name": "nestjs4-staging",
    },
    "production": {
        "app_env": "prod",
        "image_tag": "production",
        "container_name": "nestjs4-production",
    },
}


def run(command: list[str], *, check: bool = True) -> None:
    printable = " ".join(shlex.quote(part) for part in command)
    print(f"$ {printable}", flush=True)
    subprocess.run(command, check=check)


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        print(f"Missing required environment variable: {name}", file=sys.stderr)
        sys.exit(1)
    return value


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Deploy a Docker image on the server.")
    parser.add_argument(
        "--deploy-env",
        choices=sorted(DEPLOY_ENV_CONFIG.keys()),
        required=True,
        help="Deployment environment to run on the server.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    config = DEPLOY_ENV_CONFIG[args.deploy_env]

    image_name = require_env("IMAGE_NAME")
    dockerhub_username = require_env("DOCKERHUB_USERNAME")
    dockerhub_token = require_env("DOCKERHUB_TOKEN")

    deploy_image = f"{image_name}:{config['image_tag']}"

    run(["docker", "login", "-u", dockerhub_username, "-p", dockerhub_token])
    run(["docker", "pull", deploy_image])
    run(["docker", "rm", "-f", config["container_name"]], check=False)
    run(
        [
            "docker",
            "run",
            "-d",
            "--name",
            config["container_name"],
            "--restart",
            "unless-stopped",
            "--network",
            "host",
            "-e",
            f"APP_ENV={config['app_env']}",
            deploy_image,
        ]
    )

    print(
        f"Deployment finished: env={args.deploy_env}, "
        f"container={config['container_name']}, image={deploy_image}",
        flush=True,
    )


if __name__ == "__main__":
    main()
