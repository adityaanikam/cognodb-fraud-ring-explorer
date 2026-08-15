import atexit

from dotenv import load_dotenv
from flask import Flask, abort, jsonify
from flask_cors import CORS
from neo4j.exceptions import Neo4jError, ServiceUnavailable

load_dotenv()

from db import close_driver, get_driver  # noqa: E402


def create_app():
    app = Flask(__name__)
    CORS(app)

    @app.errorhandler(ServiceUnavailable)
    def handle_db_unreachable(_err):
        return (
            jsonify(
                {
                    "error": "database_unreachable",
                    "message": "Could not reach the graph database. Check that it is running and NEO4J_URI/NEO4J_PASSWORD are correct.",
                }
            ),
            503,
        )

    @app.errorhandler(Neo4jError)
    def handle_db_error(err):
        return (
            jsonify({"error": "database_error", "message": str(err)}),
            502,
        )

    @app.route("/api/health")
    def health():
        driver = get_driver()
        driver.verify_connectivity()
        return jsonify({"status": "ok"})

    @app.route("/api/accounts")
    def list_accounts():
        driver = get_driver()
        with driver.session() as session:
            result = session.run(
                "MATCH (a:Account) RETURN a{.*} AS a ORDER BY toInteger(substring(a.id, 1))"
            )
            accounts = [record["a"] for record in result]
        return jsonify(accounts)

    @app.route("/api/accounts/<account_id>")
    def account_detail(account_id):
        driver = get_driver()
        with driver.session() as session:
            result = session.run(
                """
                MATCH (a:Account {id: $account_id})
                OPTIONAL MATCH (a)-[:USED_DEVICE]->(d:Device)
                OPTIONAL MATCH (a)-[:USED_PAYMENT_METHOD]->(p:PaymentMethod)
                OPTIONAL MATCH (a)-[:SENT]->(sentTx:Transaction)-[:RECEIVED_BY]->(receiver:Account)
                OPTIONAL MATCH (sender:Account)-[:SENT]->(receivedTx:Transaction)-[:RECEIVED_BY]->(a)
                RETURN a{.*} AS a,
                       collect(DISTINCT d{.*}) AS devices,
                       collect(DISTINCT p{.*}) AS payment_methods,
                       collect(DISTINCT CASE WHEN sentTx IS NOT NULL
                           THEN {transaction: sentTx{.*}, counterparty: receiver.id} END) AS sent,
                       collect(DISTINCT CASE WHEN receivedTx IS NOT NULL
                           THEN {transaction: receivedTx{.*}, counterparty: sender.id} END) AS received
                """,
                account_id=account_id,
            )
            record = result.single()
            if record is None or not record["a"]:
                abort(404)

            return jsonify(
                {
                    "account": record["a"],
                    "devices": record["devices"],
                    "payment_methods": record["payment_methods"],
                    "sent": record["sent"],
                    "received": record["received"],
                }
            )

    @app.route("/api/accounts/<account_id>/network")
    def account_network(account_id):
        driver = get_driver()
        with driver.session() as session:
            result = session.run(
                """
                MATCH (a:Account {id: $account_id})
                MATCH path = (a)-[:USED_DEVICE|USED_PAYMENT_METHOD*1..4]-(other:Account)
                WHERE other <> a
                WITH other, min(length(path)) AS distance
                RETURN other.id AS id, other.name AS name, distance
                ORDER BY distance, id
                """,
                account_id=account_id,
            )
            neighbors = [dict(record) for record in result]
        return jsonify(neighbors)

    @app.route("/api/accounts/<account_id>/path/<other_id>")
    def shortest_connection(account_id, other_id):
        driver = get_driver()
        with driver.session() as session:
            result = session.run(
                """
                MATCH (a:Account {id: $account_id}), (b:Account {id: $other_id})
                MATCH p = shortestPath((a)-[:USED_DEVICE|USED_PAYMENT_METHOD*..10]-(b))
                RETURN [n IN nodes(p) | {
                    label: labels(n)[0],
                    id: coalesce(n.id, null),
                    name: coalesce(n.name, n.fingerprint, n.masked_number, null)
                }] AS nodes,
                length(p) AS hops
                """,
                account_id=account_id,
                other_id=other_id,
            )
            record = result.single()
            if record is None:
                return jsonify({"connected": False, "nodes": [], "hops": None})
            return jsonify({"connected": True, "nodes": record["nodes"], "hops": record["hops"]})

    @app.route("/api/fraud-rings")
    def fraud_rings():
        driver = get_driver()
        with driver.session() as session:
            device_rings = session.run(
                """
                MATCH (a:Account)-[:USED_DEVICE]->(d:Device)
                WITH d, collect(DISTINCT a.id) AS account_ids
                WHERE size(account_ids) > 1
                RETURN d.id AS shared_resource_id, account_ids
                """
            )
            payment_rings = session.run(
                """
                MATCH (a:Account)-[:USED_PAYMENT_METHOD]->(p:PaymentMethod)
                WITH p, collect(DISTINCT a.id) AS account_ids
                WHERE size(account_ids) > 1
                RETURN p.id AS shared_resource_id, account_ids
                """
            )

            rings = []
            for record in device_rings:
                rings.append(
                    {
                        "reason": "shared_device",
                        "shared_resource_id": record["shared_resource_id"],
                        "account_ids": record["account_ids"],
                    }
                )
            for record in payment_rings:
                rings.append(
                    {
                        "reason": "shared_payment_method",
                        "shared_resource_id": record["shared_resource_id"],
                        "account_ids": record["account_ids"],
                    }
                )

        return jsonify(rings)

    return app


app = create_app()
atexit.register(close_driver)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
