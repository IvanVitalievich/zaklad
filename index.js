document.addEventListener('DOMContentLoaded', () => {
    let token = localStorage.getItem('token');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    // Проверяем авторизацию при загрузке
    if (token) {
      toggleSections();
      fetchUserData();
    }
  
    // Регистрация
    window.register = async function() {
      const username = usernameInput.value;
      const password = passwordInput.value;
      
      try {
        const response = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert('Успешная регистрция, красава');
        } else {
          alert('Ты провалил(а) регистрацию!');
        }
      } catch (error) {
        console.error('Ашыпка:', error);
        alert('если никому не скажешь, то попробуй еще раз!');
      }
    };
  
    // Вход
    window.login = async function() {
      const username = usernameInput.value;
      const password = passwordInput.value;
      
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          token = data.token;
          localStorage.setItem('token', token);
          document.getElementById('user-name').textContent = data.username;
          toggleSections();
        } else {
          alert('Мы решили не регистрировать тебя(но ты попробуй еще раз)');
        }
      } catch (error) {
        console.error('Ашыпка:', error);
        alert('Ошибочка вышла!');
      }
    };
  
    // Выход
    window.logout = function() {
      localStorage.removeItem('token');
      token = null;
      toggleSections();
    };
  
    // Удаление аккаунта
    window.deleteAccount = async function() {
      if (!confirm('Что, испугался?(на самом деле тут должна быть другая шутка)) но мы ж не звери)))')) return;
      
      try {
        const response = await fetch('/api/protected/me', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          alert(data.message);
          logout();
        } else {
          alert('Пу-пу-пу, вот и ошибочка при удалении');
        }
      } catch (error) {
        console.error('Ашыпка:', error);
        alert('Сеть то твоя тянет?');
      }
    };
  
    // Покупка
    document.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (!token) {
          alert('Не-а, сначала регистрация(нам же нужны гарантии, что ты никому не расскажешь))');
          return;
        }
        
        const product = this.dataset.product;
        let message = '';
        
        switch(product) {
          case 'classic':
            message = 'Обычные закладки, которые видел каждый(т.е. для книг)';
            break;
          case 'special':
            message = 'опа! все таки нашли! ну тогда вам ничего не остается как купить такую закладку!!';
            break;
          case 'electronic':
            message = 'электронные закладки, но мир еще не дорос до кайфа от технологий';
            break;
        }
        
        document.getElementById('modal-text').textContent = message;
        const modal = new bootstrap.Modal('#buyModal');
        modal.show();
      });
    });
  
    // Вспомогательные функции
    function toggleSections() {
      document.getElementById('auth-section').classList.toggle('d-none');
      document.getElementById('user-section').classList.toggle('d-none');
    }
  
    async function fetchUserData() {
      try {
        const response = await fetch('/api/protected/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          document.getElementById('user-name').textContent = data.username;
        }
      } catch (error) {
        console.error('Ашыпка загрузки данных пользователя:', error);
      }
    }
  });