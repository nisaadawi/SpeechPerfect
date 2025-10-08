# The script of the game goes in this file.

# Declare characters used by this game. The color argument colorizes the
# name of the character.

# define e = Character("Eileen")

init python:
    
    import threading
    import time
    # 🔧 Add the absolute path to your 'module' folder so Ren'Py can import it
    sys.path.append(os.path.join(renpy.config.basedir, "module"))
 
    try:
        from firebase_fetcher import get_emotion
        import pyrebase
        renpy.notify("✅ Firebase module loaded successfully!")
    except Exception as e:
        renpy.notify(f"❌ Firebase import error: {e}")
    
    def emotion_notifier():
        """
        Background thread that checks Firebase every 10 seconds
        and shows a Ren'Py notification with the current emotion.
        """
        while True:
            emotion = get_emotion()
            renpy.notify(f"Current emotion: {emotion}")
            time.sleep(10)

    # Start background emotion monitoring
    def start_emotion_monitor():
        t = threading.Thread(target=emotion_notifier, daemon=True)
        t.start()

# Define guide character
define a = Character("Alex", color="#4ec9b0")

# Define character emotion
image alex = "images/alex.png"
image alex blink = "images/alex_blink.png"
image alex smirk = "images/alex_smirk.png"
image alex sad = "images/alex_sad.png"

# define background
image bg hall = "images/hall_bg.jpg"

# resize image
transform alex_big_center:
    xalign 0.5
    yalign 1.0
    zoom 1.5

transform bg_hall_scaled:
    zoom 2

default username = ""
default age = ""
default gender = ""
default email = ""
default password = ""

# The game starts here.

label splashscreen:
    if logged_in_user:
        jump start
    else:
        call screen login_register_menu
    return

label start:
    scene bg hall at bg_hall_scaled

    if logged_in_user is not None:
        "Welcome [logged_in_user['username']]!"
        "You're now logged in with email: [logged_in_user['email']]"

        $ renpy.notify("Starting webcam emotion recognition...")
        python:
            # Start the webcam-based emotion detection script (external)
            start_emotion_monitor()

        $ renpy.notify("Connecting to Firebase emotion monitor...")

        python:
            import threading
            import time
            from firebase_fetcher import get_emotion

            def firebase_emotion_notifier():
                """
                Runs in the background — fetches current emotion from Firebase
                every 10 seconds and displays it via renpy.notify().
                """
                while True:
                    emotion = get_emotion()
                    renpy.notify(f"Current emotion: {emotion}")
                    time.sleep(10)

            # Start Firebase emotion polling in a background thread
            t = threading.Thread(target=firebase_emotion_notifier, daemon=True)
            t.start()

        "Emotion tracking has started! Let's see how you feel."

    else:
        "You are not logged in."

    jump main_story


label main_story:
    show alex at alex_big_center

    "Hmm... I can sense your current emotion."

    # You can still respond based on 'current_emotion' if you wish to store it
    if current_emotion == "Happy":
        a "You're smiling! That’s the spirit!"
    elif current_emotion == "Sad":
        a "Aww, don’t be sad. I’ll cheer you up!"
    else:
        a "You seem calm today."

    return


label register:
    scene bg hall at bg_hall_scaled

    $ success = False

    while not success:
        show alex at alex_big_center
        with dissolve
        a "Let's get you registered! {w=2.5}{nw}"
        a "First choose the best and unique name for your username ! {w=3}{nw}"
        $ username = renpy.input("Enter your username:")

        show alex blink at alex_big_center
        a "That's a great username! {w=3}{nw}"

        a "Now, you have to enter your age {w=2.5}{nw}"
        $ age = renpy.input("Enter your age:")

        show alex smirk at alex_big_center
        a "Wow you are younger than me! {w=2.5}{nw}"

        $ gender = renpy.input("Enter your gender:")

        show alex at alex_big_center
        a "Okay ! {w=2}{nw}"

        a "Now, you have to enter your email {w=3}{nw}"
        a "Make sure email entered is correct ! {w=2.5}{nw}"
        $ email = renpy.input("Enter your email:")

        show alex blink at alex_big_center
        a "Great! {w=1.5}{nw}"
        a "Now, you have to enter your password {w=3}{nw}"
        a "Make sure password entered is strong enough ! {w=2.5}{nw}"

        $ password = renpy.input("Enter your password:", mask="*")

        show alex at alex_big_center
        a "Great! {w=2.5}{nw}"

        $ success = try_register(username, age, gender, email, password)
        if not success:
            show alex sad at alex_big_center
            a "Registration failed. Please try again."

    show alex blink at alex_big_center
    a "Great! Now, please log in with your new account."
    hide alex blink
    call screen login_register_menu
    return

label login_screen:
    scene bg hall at bg_hall_scaled
    show alex at alex_big_center

    $ success = False

    while not success:
        a "Hi there! We meet again {w=2.5}{nw}"
        a "To login, please enter correct credentials of your account ! {w=2}{nw}"
        $ email = renpy.input("Enter your email:")
        a "Great! {w=1.5}{nw}"
        a "Now make sure you enter correct password ! {w=2.5}{nw}"
        $ password = renpy.input("Enter your password:", mask="*")
        $ success = try_login(email, password)
        if not success:
            "Invalid credentials. Please try again."
            a "Awh.. I think you enter the wrong credentials. {w=2.0}{nw}"
            a "Its Okay, Let's try again ! {w=2.0}{nw}"
    "Welcome [logged_in_user['username']]!"
    "You're now logged in with email: [logged_in_user['email']]"
    return

