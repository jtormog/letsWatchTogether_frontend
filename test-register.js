// Test script para verificar la funcionalidad de registro
const testRegisterAPI = async () => {
  try {
    console.log('Testing register API...');
    
    const testData = {
      name: 'Usuario Test',
      email: 'test@example.com',
      password: 'password123',
      password_confirmation: 'password123'
    };

    const response = await fetch('http://localhost:3004/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Register API works correctly');
    } else {
      console.log('❌ Register API failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Ejecutar el test
testRegisterAPI();
