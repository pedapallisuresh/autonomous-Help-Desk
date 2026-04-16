// Core App Logic & Agent Orchestration
// Perception-Reasoning-Action Loop Simulator

class HelpDeskApp {
    constructor() {
        this.agents = {};
        this.tickets = JSON.parse(localStorage.getItem('tickets')) || [];
        this.init();
    }

    init() {
        this.loadAgents();
        this.bindEvents();
        this.updateInventory();
        this.updateSLAMetrics();
        this.loadTriageChat();
        setInterval(() => this.proactiveMonitoring(), 30000); // Proactive every 30s
    }

    loadAgents() {
        // Initialize agents from agents.js
        this.agents.iam = new IamAgent();
        this.agents.triage = new TriageAgent();
        this.agents.lifecycle = new LifecycleAgent();
        this.agents.knowledge = new KnowledgeAgent();
        this.agents.governance = new GovernanceAgent();
    }

    bindEvents() {
        // Tab switching for both tab-btn and nav-btn
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(e.target.dataset.tab).classList.add('active');
            });
        });

        // Triage chat enter key
        document.getElementById('triage-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendTriageMessage();
        });
    }

    async activateAgent(agentType, action, contextExtra = {}) {
        const agent = this.agents[agentType];
        if (!agent) return console.error('Agent not found');
        const status = document.getElementById('status');
        status.textContent = `🤖 ${agentType.toUpperCase()} Agent: Perceiving...`;
        
        try {
            // Perception
            let context = agentType === 'iam' ? {username: document.getElementById('iam-username').value} : contextExtra;
            if (typeof context === 'string') context = {message: context};
            
            // Reasoning & Action
            const response = await agent.execute(action, context);
            
            status.textContent = `✅ ${agentType.toUpperCase()} Agent: Complete.`;
            
            // Display
            const respEl = document.getElementById(`${agentType}-response`) || document.getElementById('triage-chat') || document.getElementById('knowledge-response');
            if (agentType === 'triage') {
                // Enhance display for classification
                const enhancedResponse = response.replace(/\\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                this.addChatMessage('agent', enhancedResponse);
            } else {
                respEl.innerHTML = `<div class="response-box">${response}</div>`;
            }
            if (agentType === 'lifecycle') this.updateInventory();
            
            return response; // Return for sendTriageMessage
        } catch (e) {
            status.textContent = `❌ Error: ${e.message}`;
            console.error(e);
            return null;
        }
    }

    addChatMessage(sender, text) {
        const chat = document.getElementById('triage-chat');
        const msg = document.createElement('div');
        msg.className = `chat-message ${sender}`;
        msg.textContent = `${sender === 'user' ? 'You' : 'Agent'}: ${text}`;
        chat.appendChild(msg);
        chat.scrollTop = chat.scrollHeight;
    }

    async sendTriageMessage() {
        const input = document.getElementById('triage-input');
        const message = input.value.trim();
        if (!message) return;
        
        app.addChatMessage('user', message);
        input.value = '';
        
        const sentiment = app.agents.triage.analyzeSentiment(message);
        document.getElementById('triage-sentiment').innerHTML = `<p>Sentiment: ${sentiment} 😊</p>`;
        
        // Show processing
        app.addChatMessage('agent', '🤖 Analyzing and classifying your issue...');
        
        // Trigger agent
        const response = await app.activateAgent('triage', 'resolve', message);
        
        // The response already includes classification/assignee via agent.act()
        // Optionally parse and highlight if needed
        console.log('Classification complete:', response);
    }

    loadTriageChat() {
        // Placeholder for loading persisted chat
        console.log('Chat loaded');
    }

    updateInventory() {
        const inventory = JSON.parse(localStorage.getItem('inventory')) || ['Laptop-001', 'Monitor-042', 'Software-Jamf'];
        const list = document.getElementById('inventory-list');
        list.innerHTML = inventory.map(item => `<li>${item}</li>`).join('');
    }

    updateSLAMetrics() {
        const metrics = {
            resolutionRate: '98%',
            avgTime: '2.3 min',
            compliance: '100%'
        };
        document.getElementById('sla-metrics').innerHTML = `
            <h3>SLA Metrics</h3>
            <p>Resolution Rate: ${metrics.resolutionRate}</p>
            <p>Avg Response: ${metrics.avgTime}</p>
            <p>Compliance: ${metrics.compliance}</p>
        `;
    }

    proactiveMonitoring() {
        // Simulate proactive resolution
        const status = document.getElementById('status');
        status.textContent = '🛡️ Proactive: Scanned for threats - All clear.';
    }

    queryKnowledge() {
        const query = document.getElementById('query-input').value;
        const response = app.agents.knowledge.generateResponse(query);
        document.getElementById('knowledge-response').innerHTML = `<div class="response-box">${response}</div>`;
    }
}

// Global app instance
const app = new HelpDeskApp();

// Expose for onclick handlers - support extra args
window.activateAgent = (...args) => app.activateAgent(...args);
window.sendTriageMessage = () => app.sendTriageMessage();
window.queryKnowledge = () => app.queryKnowledge();
window.runQualityAssurance = () => app.agents.governance.runQA();
window.updateInventory = () => app.updateInventory();

console.log('Autonomous Help Desk loaded! Open console for agent logs.');

