const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBox = document.getElementById('signup_box');
const loginForm = signupBox.querySelector('form');
const googleLoginBtn = document.getElementById('google-login-btn');
const githubLoginBtn = document.getElementById('github-login-btn');

function handlelogin() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log(userCredential);
            alert('Đăng nhập thành công!');
            signupBox.style.display = 'none';   
            window.location.href = 'index.html';
        }
        )
        .catch((error) => {
            console.error('lỗi', error);
            alert('Đăng nhập thất bại: ' + error.message);
        }
        );  
}

function handleSocialLogin(provider) {
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
            alert('Đăng nhập thành công!');
            signupBox.style.display = 'none';
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Lỗi đăng nhập:', error);
            alert('Lỗi đăng nhập: ' + error.message);
        });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handlelogin();
    });
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        handleSocialLogin(provider);
    });
}

if (githubLoginBtn) {
    githubLoginBtn.addEventListener('click', () => {
        const provider = new firebase.auth.GithubAuthProvider();
        handleSocialLogin(provider);
    });
}
