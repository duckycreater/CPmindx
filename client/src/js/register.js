const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm_password');
const usernameInput = document.getElementById('username');
const signupBox = document.getElementById('signup_box');
const googleSignupBtn = document.getElementById('google-signup-btn');
const githubSignupBtn = document.getElementById('github-signup-btn');

function handleRegister() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const username = usernameInput.value.trim();
    if (password !== confirmPassword) {
        alert('mk k khớp');
        console.log('sai mk xác nhận r ')
        return;
    }
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log(userCredential);
            const user = userCredential.user;
            return db.collection('users').doc(user.uid).set({
                username: username,
                email: email,
                password: password,
                balance: 0,
                role_id: 1

            });
        })
        .then(() => {
            console.log('l');
            alert('Đăng ký thành công!');
            window.location.href = 'login.html';  
        }
        )
        .catch((error) => {
            console.error('lỗi', error);
        }
        );
}   

function handleSocialRegister(provider) {
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            // Check if user exists in db
            return db.collection('users').doc(user.uid).get().then((doc) => {
                if (!doc.exists) {
                    // Create new user doc
                    return db.collection('users').doc(user.uid).set({
                        username: user.displayName || user.email.split('@')[0],
                        email: user.email,
                        balance: 0,
                        role_id: 1,
                        authProvider: provider.providerId
                    });
                }
            });
        })
        .then(() => {
            alert('Đăng ký/Đăng nhập thành công!');
            window.location.href = 'login.html';
        })
        .catch((error) => {
            console.error('Lỗi đăng ký:', error);
            alert('Lỗi đăng ký: ' + error.message);
        });
}

signupBox.addEventListener('submit', (e) => {
    e.preventDefault();
    handleRegister();
});

if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        handleSocialRegister(provider);
    });
}

if (githubSignupBtn) {
    githubSignupBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GithubAuthProvider();
        handleSocialRegister(provider);
    });
}
