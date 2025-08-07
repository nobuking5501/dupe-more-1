#!/bin/bash

echo "Claude Helper セットアップ開始..."

# ログディレクトリの確認
mkdir -p ../logs

# Python環境の確認
if command -v python3 &> /dev/null; then
    echo "Python3 が見つかりました"
    python3 --version
else
    echo "Python3 が見つかりません。インストールしてください。"
    exit 1
fi

# スクリプトの実行権限設定
chmod +x *.py
chmod +x *.sh

echo "初期セットアップを実行中..."
python3 dev_assistant.py

echo "セットアップ完了！"
echo "ログは ../logs/ ディレクトリに保存されます"