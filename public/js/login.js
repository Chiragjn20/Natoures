/* eslint-disable */

  import {showAlert}  from './alerts'
 export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await fetch('http://localhost:3000/api/v1/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (json.status === 'success') {
      showAlert('success','Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error','Incorrect email or password');
  }
};

// document.querySelector('.form').addEventListener('submit', (e) => {
//   e.preventDefault();

//   const email = document.getElementById('email').value;
//   const password = document.getElementById('password').value;
//   login(email, password);
// });

const logOutBtn = document.querySelector('.nav__el.nav__el--logout');

export const logout = async () => {
    try{
    const res = await fetch( 'http://localhost:3000/api/v1/users/logout',  {
      method:'GET'
    })
    console.log(res);
    if (res.formData.status = 'success') {
      showAlert('info','logged out');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
   } catch(err){
  console.log(err.response)
  }

  console.log('log out function called');
};

logOutBtn && logOutBtn.addEventListener('click', logout);
