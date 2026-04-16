// Agent Implementations with Perception-Reasoning-Action Loops

class BaseAgent {
    async execute(action, context = {}) {
        if (!this.employees.domains) await this.loadEmployees();
        console.log(`Agent ${this.name}: Executing ${action}`);
        // Simulated loop
        const perception = await this.perceive(context);
        const reasoning = this.reason(action, perception);
        const actionResult = await this.act(reasoning);
        return actionResult;
    }

    async perceive(context) {
        const base = context;
        if (typeof base === 'string') base = {message: base};
        return {...base, employees: this.employees};
    }
    reason(action, perception) { return { action, perception }; }
    act(plan) { return `Executed: ${plan.action}`; }
}

class IamAgent extends BaseAgent {
    name = 'IAM';

    async act(plan) {
        const username = plan.perception.username || 'demo';
        switch (plan.action) {
            case 'reset-password':
                return `✅ Password reset for ${username}. New temp password: P@ssw0rd123! Check email simulation.`;
            case 'mfa-reset':
                return `✅ MFA reset for ${username}. New QR code generated. Rescan app.`;
            case 'provision-access':
                return `✅ Access provisioned to Okta/Azure AD for ${username}. Apps: Slack, Jira unlocked.`;
            default:
                return 'Unknown IAM action.';
        }
    }
}

class TriageAgent extends BaseAgent {
    name = 'Triage';

    employees = {};

    async loadEmployees() {
        try {
            const response = await fetch('data/employees.json');
            this.employees = await response.json();
        } catch (e) {
            console.warn('Employees data not loaded:', e);
            this.employees = {domains: {unknown: [{name: 'General Support', email: 'support@company.com'}]}};
        }
    }

    analyzeSentiment(text) {
        const score = text.toLowerCase().split(' ').reduce((s, w) => {
            if (w.includes('frustrat') || w.includes('urgent')) return s - 0.3;
            if (w.includes('happy') || w.includes('thanks')) return s + 0.2;
            return s;
        }, 0);
        return score > 0 ? 'Positive' : score < -0.1 ? 'Frustrated' : 'Neutral';
    }

    reason(action, perception) {
        const base = super.reason(action, perception);
        const issue = typeof perception === 'object' ? (perception.message || '').toLowerCase() : perception.toLowerCase();
        let priority = 'Low';
        if (issue.includes('urgent') || issue.includes('down')) priority = 'High';
        
        const classification = this.classifyProblem(issue);
        const assignee = classification.domain !== 'unknown' ? 
            perception.employees.domains[classification.domain][0] : 
            perception.employees.domains.unknown[0];
        
        return { 
            ...base, 
            priority, 
            classification,
            assignee,
            autoResolve: this.canAutoResolve(issue, classification.domain)
        };
    }

    classifyProblem(issue) {
        const keywords = {
            'iam': ['password', 'login', 'access', 'mfa', 'okta', 'azure ad', 'account'],
            'network': ['wifi', 'vpn', 'connect', 'internet', 'network', 'ping'],
            'hardware': ['laptop', 'monitor', 'keyboard', 'screen', 'battery', 'device', 'hardware'],
            'software': ['app', 'software', 'jamf', 'install', 'crash', 'error', 'update'],
            'lifecycle': ['equipment', 'provision', 'new device', 'asset', 'inventory'],
            'governance': ['sla', 'compliance', 'policy', 'audit', 'qa']
        };
        
        for (const [domain, words] of Object.entries(keywords)) {
            if (words.some(word => issue.includes(word))) {
                return { domain, confidence: 0.8 };
            }
        }
        return { domain: 'unknown', confidence: 0.3 };
    }

    canAutoResolve(issue, domain) {
        const autoResolvers = {
            'iam': issue.includes('password') || issue.includes('mfa'),
            'network': issue.includes('wifi') || issue.includes('restart'),
            'software': issue.includes('restart') || issue.includes('update')
        };
        return autoResolvers[domain] || false;
    }

    async act(plan) {
        const issue = typeof plan.perception === 'object' ? (plan.perception.message || 'unknown') : plan.perception;
        const { classification, assignee, autoResolve } = plan;
        
        let response;
        if (autoResolve) {
            response = `🎯 Auto-resolved (${classification.domain}): ${issue.slice(0,50)}... Fixed! SLA met.`;
        } else {
            response = `📋 Classified: **${classification.domain.toUpperCase()}** (confidence ${Math.round(classification.confidence*100)}%)\\n👤 Assigned to: ${assignee.name} (${assignee.expertise})\\n📧 Email: ${assignee.email}\\n⏰ Priority: ${plan.priority}\\nNext: Ticket #${Date.now()} created & notified.`;
        }
        return response;
    }
}

class LifecycleAgent extends BaseAgent {
    name = 'Lifecycle';

    async act(plan) {
        switch (plan.action) {
            case 'provision-software':
                localStorage.setItem('inventory', JSON.stringify(['Laptop-001', 'Monitor-042', 'Software-Jamf-Pro', 'New-Software']));
                return `✅ Jamf/Intune: Software provisioned. Available in Self-Service catalog. Deployed in 45s.`;
            case 'new-equipment':
                const newItem = `Equipment-${Date.now()}`;
                const inv = JSON.parse(localStorage.getItem('inventory')) || [];
                inv.push(newItem);
                localStorage.setItem('inventory', JSON.stringify(inv));
                return `✅ New equipment ${newItem} requested & tracked. Onboarding workflow triggered.`;
            default:
                return 'Lifecycle action complete.';
        }
    }
}

class KnowledgeAgent extends BaseAgent {
    name = 'Knowledge';

    async perceive(context) {
        // Load knowledge base
        const kb = await fetch('data/knowledge-base.json').then(r => r.json()).catch(() => ({}));
        return { query: context, kb };
    }

    generateResponse(query) {
        // Simple generative simulation + KB fetch
        const responses = {
            'password': 'To reset password: Go to portal.company.com/reset → Enter email → Follow steps.',
            'wifi': 'WiFi fix: Forget network → Reconnect with WPA3 → VPN if remote.',
            'jamf': 'Jamf Self-Service: Open Jamf app → Browse catalog → Install.',
            'mfa': 'Rescan QR code in auth app or use backup codes.',
            default: 'No exact match found in KB. Documentation gap detected - drafting new article. General: Try restart or check status page.'
        };
        const key = Object.keys(responses).find(k => query.toLowerCase().includes(k)) || 'default';
        return responses[key];
    }
}

class GovernanceAgent extends BaseAgent {
    name = 'Governance';

    runQA() {
        const tickets = JSON.parse(localStorage.getItem('tickets')) || [];
        const issues = tickets.filter(t => t.slaBreach).length;
        const result = issues === 0 ? '✅ 100% QA Pass. All tickets compliant.' : `⚠️ ${issues} potential breaches. Auto-escalated.`;
        document.getElementById('qa-results').innerHTML = `<div class="response-box">${result}</div>`;
        return result;
    }

    act(plan) {
        return 'SLA monitored. Auto-alerts active.';
    }
}

