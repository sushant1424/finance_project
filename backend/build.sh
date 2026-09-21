#!/usr/bin/bash
set -e

# Upgrade pip first
pip install --upgrade pip --no-cache-dir

# Install pydantic-core with latest version first to ensure Python 3.14 compatibility
pip install --no-cache-dir --upgrade pydantic-core

# Install remaining dependencies
pip install --no-cache-dir -r requirements.txt
