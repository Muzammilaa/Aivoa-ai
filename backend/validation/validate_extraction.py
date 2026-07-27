import json
from dataclasses import dataclass
from typing import Any
from urllib.request import Request, urlopen


@dataclass(frozen=True)
class TestCase:
    name: str
    text: str
    expected_non_null: tuple[str, ...] = ()


TEST_CASES = (
    TestCase(
        "complete complaint",
        "Hospital Central reported by email on 28 July 2026 that Ceftriaxone Sodium 1 g, batch CEF2601, manufactured 10 January 2026 and expiring 09 January 2028, arrived with white powder clumping. Quantity affected: 12 cartons. The complaint concerns product appearance.",
        ("customer_name", "product_name", "batch_lot_number", "manufacturing_date", "expiry_date"),
    ),
    TestCase(
        "missing batch number",
        "A distributor reported leakage from Omeprazole 20 mg capsules received in 5 boxes. The product was supplied by email; the batch number was not provided.",
        ("complaint_type", "product_name", "quantity_affected"),
    ),
    TestCase(
        "missing manufacturing date",
        "Green Cross Pharmacy reported broken Amoxicillin 500 mg tablets in batch AMX-771. The expiry date is 30 November 2027 and 3 blister packs were affected.",
        ("batch_lot_number", "expiry_date", "quantity_affected"),
    ),
    TestCase(
        "expiry date present",
        "A customer complaint states that insulin injection 100 IU/mL, batch INS-26-04, expires on 31 March 2028. One vial had visible particles.",
        ("product_name", "batch_lot_number", "expiry_date"),
    ),
    TestCase(
        "quantity affected",
        "A hospital reports 50 kg of Metformin Hydrochloride API batch MET-500 were affected by yellow discoloration. The complaint was received by phone.",
        ("product_name", "batch_lot_number", "quantity_affected", "complaint_type"),
    ),
    TestCase(
        "multiple products mentioned",
        "A distributor compared Paracetamol 500 mg batch PCM100, which had no issue, with Ibuprofen 400 mg batch IBU200, where tablets were broken. Only IBU200 is the complained-of product.",
        ("product_name", "batch_lot_number", "complaint_type"),
    ),
    TestCase(
        "high severity contamination",
        "A hospital quality unit reported suspected microbial contamination in sterile Vancomycin 500 mg vials, batch VAN-CRIT-01. The affected quantity is 20 vials and the complaint is critical.",
        ("product_name", "batch_lot_number", "complaint_type", "initial_severity"),
    ),
    TestCase(
        "labelling issue from pharmacy",
        "A pharmacy reported a labelling issue on Losartan 50 mg tablets, batch LOS-883: the carton says 25 mg while the blister says 50 mg. Ten cartons are affected.",
        ("product_name", "batch_lot_number", "complaint_type", "quantity_affected"),
    ),
    TestCase(
        "leakage from customer",
        "Customer ABC Pharma reported leakage from two sealed bottles of Sodium Chloride solution 0.9%, batch NS-2026-11. The complaint was received through the customer portal.",
        ("customer_name", "product_name", "batch_lot_number", "complaint_type"),
    ),
    TestCase(
        "minimal complaint",
        "Broken tablets in a medicine shipment.",
        ("complaint_type", "description"),
    ),
)


def call_extract(base_url: str, text: str) -> tuple[int, dict[str, Any]]:
    request = Request(
        f"{base_url}/api/intake/extract",
        data=json.dumps({"text": text}).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(request, timeout=120) as response:
        return response.status, json.loads(response.read().decode("utf-8"))


def main() -> None:
    results = []
    for test_case in TEST_CASES:
        status, payload = call_extract("http://127.0.0.1:8001", test_case.text)
        extracted_data = payload.get("extracted_data", {})
        errors = payload.get("parsing_errors", [])
        missing_expected = [
            field for field in test_case.expected_non_null if not extracted_data.get(field)
        ]
        passed = status == 200 and not errors and not missing_expected
        results.append(
            {
                "test_name": test_case.name,
                "input_text": test_case.text,
                "http_status": status,
                "extracted_json": extracted_data,
                "parsing_errors": errors,
                "pass": passed,
                "missing_expected_fields": missing_expected,
            }
        )
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    main()
