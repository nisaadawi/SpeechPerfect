default logged_in_user = None

init python:
    import urllib.request
    import json

    def send_post_request(url, data):
        headers = {'Content-Type': 'application/json'}
        req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers)
        try:
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        except Exception as e:
            return {"success": False, "message": str(e)}

    def try_register(username, age, gender, email, password):
        url = "http://humancc.site/ndhos/renpy_backend/register.php"
        data = {
            "username": username,
            "age": int(age),
            "gender": gender,
            "email": email,
            "password": password
        }
        response = send_post_request(url, data)
        if response.get("success"):
            renpy.notify("✅ " + response.get("message"))
            return True
        else:
            renpy.notify("❌ " + response.get("message"))
            return False

    def try_login(email, password):
        url = "http://humancc.site/ndhos/renpy_backend/login.php"
        data = {"email": email, "password": password}
        response = send_post_request(url, data)
        if response.get("success"):
            store.logged_in_user = response.get("user")
            return True
        else:
            renpy.notify("❌ " + response.get("message"))
            return False
