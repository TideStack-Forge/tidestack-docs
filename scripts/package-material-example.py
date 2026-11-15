"""从示例源码生成手册下载包，不包含构建输出和本地隐藏文件。"""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo

handbook_root = Path(__file__).resolve().parent.parent
source = handbook_root / "examples" / "material-registration"
output = handbook_root / "static" / "examples" / "material-registration.zip"
output.parent.mkdir(parents=True, exist_ok=True)

with ZipFile(output, "w", compression=ZIP_DEFLATED) as archive:
    for path in sorted(source.rglob("*")):
        relative = path.relative_to(source)
        if not path.is_file() or any(part.startswith(".") or part in ("target", "__pycache__") for part in relative.parts):
            continue
        info = ZipInfo("material-registration/" + relative.as_posix(), date_time=(2020, 1, 1, 0, 0, 0))
        info.compress_type = ZIP_DEFLATED
        info.external_attr = 0o100644 << 16
        archive.writestr(info, path.read_bytes())

print(f"Generated {output.relative_to(handbook_root)}")
