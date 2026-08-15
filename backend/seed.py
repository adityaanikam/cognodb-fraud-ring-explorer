from dotenv import load_dotenv

load_dotenv()

from db import close_driver, get_driver  # noqa: E402

CONSTRAINTS = [
    "CREATE CONSTRAINT account_id IF NOT EXISTS FOR (a:Account) REQUIRE a.id IS UNIQUE",
    "CREATE CONSTRAINT device_id IF NOT EXISTS FOR (d:Device) REQUIRE d.id IS UNIQUE",
    "CREATE CONSTRAINT payment_method_id IF NOT EXISTS FOR (p:PaymentMethod) REQUIRE p.id IS UNIQUE",
    "CREATE CONSTRAINT transaction_id IF NOT EXISTS FOR (t:Transaction) REQUIRE t.id IS UNIQUE",
]

ACCOUNTS = [
    {"id": "A1", "name": "Marcus Cole", "opened_at": "2026-01-05", "status": "active"},
    {"id": "A2", "name": "Priya Anand", "opened_at": "2026-01-06", "status": "active"},
    {"id": "A3", "name": "Devon Reyes", "opened_at": "2026-01-07", "status": "active"},
    {"id": "A4", "name": "Lena Fischer", "opened_at": "2026-02-11", "status": "active"},
    {"id": "A5", "name": "Omar Haddad", "opened_at": "2026-02-12", "status": "active"},
    {"id": "A6", "name": "Grace Lin", "opened_at": "2025-11-01", "status": "active"},
    {"id": "A7", "name": "Sam Okafor", "opened_at": "2025-11-15", "status": "active"},
    {"id": "A8", "name": "Ivy Novak", "opened_at": "2025-12-02", "status": "active"},
    {"id": "A9", "name": "Theo Park", "opened_at": "2025-12-20", "status": "active"},
    {"id": "A10", "name": "Nadia Silva", "opened_at": "2026-01-30", "status": "active"},
]

DEVICES = [
    {"id": "dev-fraud-1", "fingerprint": "fp-9a3c-shared"},
    {"id": "dev-4", "fingerprint": "fp-4401"},
    {"id": "dev-5", "fingerprint": "fp-5502"},
    {"id": "dev-6", "fingerprint": "fp-6603"},
    {"id": "dev-7", "fingerprint": "fp-7704"},
    {"id": "dev-8", "fingerprint": "fp-8805"},
    {"id": "dev-9", "fingerprint": "fp-9906"},
    {"id": "dev-10", "fingerprint": "fp-1007"},
]

PAYMENT_METHODS = [
    {"id": "pm-fraud-1", "type": "card", "masked_number": "4111-xxxx-xxxx-9981"},
    {"id": "pm-1", "type": "card", "masked_number": "4111-xxxx-xxxx-1001"},
    {"id": "pm-2", "type": "card", "masked_number": "4111-xxxx-xxxx-1002"},
    {"id": "pm-3", "type": "bank", "masked_number": "xxxx-1003"},
    {"id": "pm-6", "type": "card", "masked_number": "4111-xxxx-xxxx-1006"},
    {"id": "pm-7", "type": "bank", "masked_number": "xxxx-1007"},
    {"id": "pm-8", "type": "card", "masked_number": "4111-xxxx-xxxx-1008"},
    {"id": "pm-9", "type": "bank", "masked_number": "xxxx-1009"},
    {"id": "pm-10", "type": "card", "masked_number": "4111-xxxx-xxxx-1010"},
]

# (account_id, device_id) — A1, A2, A3 share a single device: ring signal.
ACCOUNT_DEVICE = [
    ("A1", "dev-fraud-1"),
    ("A2", "dev-fraud-1"),
    ("A3", "dev-fraud-1"),
    ("A4", "dev-4"),
    ("A5", "dev-5"),
    ("A6", "dev-6"),
    ("A7", "dev-7"),
    ("A8", "dev-8"),
    ("A9", "dev-9"),
    ("A10", "dev-10"),
]

# (account_id, payment_method_id) — A4, A5 share a single payment method: second ring.
ACCOUNT_PAYMENT_METHOD = [
    ("A4", "pm-fraud-1"),
    ("A5", "pm-fraud-1"),
    ("A1", "pm-1"),
    ("A2", "pm-2"),
    ("A3", "pm-3"),
    ("A6", "pm-6"),
    ("A7", "pm-7"),
    ("A8", "pm-8"),
    ("A9", "pm-9"),
    ("A10", "pm-10"),
]

# Rapid closed-loop transactions inside each ring, plus normal one-off transfers elsewhere.
TRANSACTIONS = [
    {"id": "T1", "amount": 480.00, "timestamp": "2026-03-01T09:00:00Z", "from": "A1", "to": "A2"},
    {"id": "T2", "amount": 475.00, "timestamp": "2026-03-01T09:02:00Z", "from": "A2", "to": "A3"},
    {"id": "T3", "amount": 470.00, "timestamp": "2026-03-01T09:04:00Z", "from": "A3", "to": "A1"},
    {"id": "T4", "amount": 900.00, "timestamp": "2026-03-02T14:00:00Z", "from": "A4", "to": "A5"},
    {"id": "T5", "amount": 895.00, "timestamp": "2026-03-02T14:01:00Z", "from": "A5", "to": "A4"},
    {"id": "T6", "amount": 120.00, "timestamp": "2026-02-10T10:00:00Z", "from": "A6", "to": "A7"},
    {"id": "T7", "amount": 60.00, "timestamp": "2026-02-15T16:30:00Z", "from": "A8", "to": "A9"},
    {"id": "T8", "amount": 200.00, "timestamp": "2026-02-20T11:15:00Z", "from": "A9", "to": "A10"},
    {"id": "T9", "amount": 45.00, "timestamp": "2026-02-22T08:45:00Z", "from": "A7", "to": "A6"},
]


def seed():
    driver = get_driver()
    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")

        for stmt in CONSTRAINTS:
            session.run(stmt)

        session.run(
            "UNWIND $rows AS row CREATE (a:Account) SET a = row",
            rows=ACCOUNTS,
        )
        session.run(
            "UNWIND $rows AS row CREATE (d:Device) SET d = row",
            rows=DEVICES,
        )
        session.run(
            "UNWIND $rows AS row CREATE (p:PaymentMethod) SET p = row",
            rows=PAYMENT_METHODS,
        )

        session.run(
            """
            UNWIND $rows AS row
            MATCH (a:Account {id: row[0]}), (d:Device {id: row[1]})
            CREATE (a)-[:USED_DEVICE]->(d)
            """,
            rows=ACCOUNT_DEVICE,
        )
        session.run(
            """
            UNWIND $rows AS row
            MATCH (a:Account {id: row[0]}), (p:PaymentMethod {id: row[1]})
            CREATE (a)-[:USED_PAYMENT_METHOD]->(p)
            """,
            rows=ACCOUNT_PAYMENT_METHOD,
        )
        session.run(
            """
            UNWIND $rows AS row
            MATCH (sender:Account {id: row.from}), (receiver:Account {id: row.to})
            CREATE (t:Transaction {id: row.id, amount: row.amount, timestamp: row.timestamp})
            CREATE (sender)-[:SENT]->(t)
            CREATE (t)-[:RECEIVED_BY]->(receiver)
            """,
            rows=TRANSACTIONS,
        )

        print(
            f"Seeded {len(ACCOUNTS)} accounts, {len(DEVICES)} devices, "
            f"{len(PAYMENT_METHODS)} payment methods, {len(TRANSACTIONS)} transactions."
        )


if __name__ == "__main__":
    seed()
    close_driver()
