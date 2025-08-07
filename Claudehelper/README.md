# Claude Helper

開発アシスト用のフォルダです。

## 構成

- `logs/` - ログファイルの保存場所
- `scripts/` - 開発支援スクリプト
- `configs/` - 設定ファイル
- `templates/` - テンプレートファイル

## 使用方法

### ログシステム
```python
from scripts.logger import ClaudeLogger

logger = ClaudeLogger()
logger.log("メッセージ", "INFO", "カテゴリ")
logger.log_task("タスク名", "started")
logger.log_error("エラーメッセージ")
```

### 開発アシスタント
```python
from scripts.dev_assistant import DevAssistant

assistant = DevAssistant()
structure = assistant.analyze_project_structure()
configs = assistant.find_config_files()
result = assistant.run_command("ls -la")
```

## ログファイル形式

ログはJSONL形式で保存されます：
```json
{"timestamp": "2025-08-02T...", "session_id": "20250802_...", "level": "INFO", "category": "general", "message": "..."}
```