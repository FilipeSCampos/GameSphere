import re
from app.models.schemas import ParsedRequirements

def parse_requirements(text: str) -> ParsedRequirements:
    """
    Parses unstructured system requirements text to extract CPU, GPU, RAM, Storage, and OS.
    """
    if not text:
        return ParsedRequirements()

    # Normalize text
    text = text.replace('\n', ' ').replace('\r', '')
    
    # Regex patterns (simplified for initial version)
    cpu_pattern = r"(?i)(?:processor|cpu):\s*([^,;]+)"
    gpu_pattern = r"(?i)(?:graphics|video card|gpu):\s*([^,;]+)"
    ram_pattern = r"(?i)(?:memory|ram):\s*([^,;]+)"
    storage_pattern = r"(?i)(?:storage|hard drive|space):\s*([^,;]+)"
    os_pattern = r"(?i)(?:os|operating system):\s*([^,;]+)"

    cpu_match = re.search(cpu_pattern, text)
    gpu_match = re.search(gpu_pattern, text)
    ram_match = re.search(ram_pattern, text)
    storage_match = re.search(storage_pattern, text)
    os_match = re.search(os_pattern, text)

    return ParsedRequirements(
        cpu=cpu_match.group(1).strip() if cpu_match else None,
        gpu=gpu_match.group(1).strip() if gpu_match else None,
        ram=ram_match.group(1).strip() if ram_match else None,
        storage=storage_match.group(1).strip() if storage_match else None,
        os=os_match.group(1).strip() if os_match else None
    )
