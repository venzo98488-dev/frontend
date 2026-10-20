const { io } = require('./frontend/node_modules/socket.io-client');

const BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function testAutoClarity() {
    console.log('Testing Automatic Doubt Clarity Reply Feature...');

    // 1. Log in as Student
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@college.edu', password: 'Password@123' })
    });

    const loginData = await loginRes.json();
    const token = loginData.token;
    const student = loginData.user;
    console.log(`✓ Student Authenticated: ${student.name} (ID: ${student.id})`);

    // 2. Connect via Socket.io
    const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket']
    });

    await new Promise((resolve, reject) => {
        socket.on('connect', () => {
            console.log('✓ Connected to Socket.io Doubt Clearance server');
            resolve();
        });
        socket.on('connect_error', reject);
    });

    // 3. Listen for typing indicator and automatic clarity reply
    let typingReceived = false;
    let autoReplyReceived = false;

    socket.on('user_typing', (data) => {
        console.log(`[Socket Event] user_typing:`, data);
        if (data.isTyping) {
            typingReceived = true;
        }
    });

    const replyPromise = new Promise((resolve) => {
        socket.on('new_message', (msg) => {
            console.log(`[Socket Event] new_message received from ${msg.sender_name}:`);
            console.log('----------------------------------------------------');
            console.log(msg.message);
            console.log('----------------------------------------------------');

            if (msg.message.includes('Automated Doubt Clarity Assistant') || msg.is_auto_clarity) {
                autoReplyReceived = true;
                resolve(msg);
            }
        });
    });

    // 4. Send a student doubt
    console.log('\nSending doubt: "Can you explain ACID properties in DBMS and how transactions maintain consistency?"');
    socket.emit('send_message', {
        receiver_id: 1, // Dr. Sarah Jenkins (STAFF)
        message: 'Can you explain ACID properties in DBMS and how transactions maintain consistency?'
    });

    // Wait for auto-reply
    const autoReply = await Promise.race([
        replyPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout waiting for automated clarity reply')), 6000))
    ]);

    socket.disconnect();

    console.log('\n✓ SUCCESS: Automated Clarity Reply Received and Verified!');
    console.log(`  Typing indicator received? ${typingReceived ? 'YES' : 'NO'}`);
    console.log(`  Auto reply received? ${autoReplyReceived ? 'YES' : 'NO'}`);
}

testAutoClarity().catch(err => {
    console.error('Error testing auto clarity:', err);
    process.exit(1);
});
