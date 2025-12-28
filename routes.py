from flask import render_template, request, redirect, url_for
from models import get_db_connection

def register_routes(app):

    @app.route("/", methods=["GET", "POST"])
    def login():
        if request.method == "POST":
            data = (
                request.form["name"],
                request.form["mobile"],
                request.form["gender"],
                request.form["aadhaar"],
                request.form["license"],
                request.form["location"]
            )

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO users(name,mobile,gender,aadhaar,license,location)
                VALUES(?,?,?,?,?,?)
            """, data)
            user_id = cur.lastrowid
            conn.commit()
            conn.close()

            return redirect(url_for("ticket", user_id=user_id))

        return render_template("login.html")

    @app.route("/ticket/<int:user_id>", methods=["GET", "POST"])
    def ticket(user_id):
        if request.method == "POST":
            payment_mode = request.form["payment"]

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO tickets(user_id,amount,payment_mode,status)
                VALUES(?,?,?,?)
            """, (user_id, 20, payment_mode, "PAID"))
            conn.commit()
            conn.close()

            return redirect(url_for("categories", user_id=user_id))

        return render_template("ticket.html")

    @app.route("/categories/<int:user_id>")
    def categories(user_id):
        return render_template("categories.html", user_id=user_id)

    @app.route("/vehicles/<int:user_id>/<category>", methods=["GET", "POST"])
    def vehicles(user_id, category):
        if request.method == "POST":
            vehicle = request.form["vehicle"]
            duration = request.form["duration"]
            cost = int(request.form["cost"])

            return redirect(url_for("payment",
                                    user_id=user_id,
                                    vehicle=vehicle,
                                    duration=duration,
                                    cost=cost))

        return render_template("vehicles.html",
                               category=category,
                               user_id=user_id)

    @app.route("/payment/<int:user_id>/<vehicle>/<duration>/<int:cost>", methods=["GET","POST"])
    def payment(user_id, vehicle, duration, cost):
        if request.method == "POST":
            mode = request.form["payment"]

            conn = get_db_connection()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO bookings(user_id,vehicle_type,vehicle_name,duration,cost,payment_mode)
                VALUES(?,?,?,?,?,?)
            """, (user_id,"Rental",vehicle,duration,cost,mode))
            conn.commit()
            conn.close()

            return redirect(url_for("safety"))

        return render_template("payment.html",
                               vehicle=vehicle,
                               duration=duration,
                               cost=cost)

    @app.route("/safety")
    def safety():
        return render_template("safety.html")

    @app.route("/thankyou")
    def thankyou():
        return render_template("thankyou.html")
