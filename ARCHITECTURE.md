# Autonomous Helpdesk Chatbot: Architecture & Workflow

## 🏗️ High-Level Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   UI Layer      │───▶│ Orchestration    │───▶│  Agent Layer     │
│ (index.html +   │    │ (script.js)      │    │ (agents.js)      │
│  styles.css)    │    │                  │    │                  │
└─────────────────┘    └──────────────────┘    └──────────────────┘
                                    │                    │
                                    ▼                    ▼
                           ┌──────────────────┐ ┌──────────────────┐
                           │ Data Layer       │ │   Processing     │
                           │ - employees.json │ │ - Classification │
                           │ - knowledge.json │ │ - Assignment     │
                           └──────────────────┘ └──────────────────┘
```

**Layers:**
1. **UI Layer** (`index.html`, `styles.css`): Triage chat interface, tabs, rich responses
2. **Orchestration** (`script.js`): HelpDeskApp coordinates agents, handles chat flow
3. **Agent Layer** (`agents.js`): **TriageAgent** core - Perception/Reason/Act loop
4. **Data Layer**: `employees.json` (assignments), `knowledge-base.json` (domain docs)

## 🔄 Detailed Workflow (User → Resolution)

```
User types: "password reset urgent"

1. UI: sendTriageMessage() → app.activateAgent('triage', 'resolve', msg)
   ↓
2. Orchestration: HelpDeskApp.activateAgent()
   - Loads agent
   - Calls agent.execute('resolve', {message})
   ↓
3. TriageAgent.execute(): **Perceive → Reason → Act**
   a. PERCEIVE:
      - Loads employees.json
      - Returns {message, employees}
   b. REASON:
      - analyzeSentiment("urgent" → Frustrated)
      - classifyProblem("password" → {domain: "iam", confidence: 0.8})
      - get assignee: John Doe (IAM Specialist)
      - canAutoResolve(iam, "password") → false (escalate)
      - priority: High (contains "urgent")
   c. ACT:
      - Returns formatted: "📋 Classified: **IAM** (80%) 👤 John Doe... 📧 john@company.com"
   ↓
4. UI Display:
   - HTML formatting: **bold domain**, <br> lines
   - Chat message with green agent bubble
   ↓
5. Console: Logs classification details
```

## 🎯 Classification Engine (TriageAgent.classifyProblem)
**Keyword Matching** (extendable):
```
iam: ['password', 'login', 'access', 'mfa']
network: ['wifi', 'vpn', 'connect']
hardware: ['laptop', 'monitor', 'battery']
software: ['app', 'jamf', 'crash']
```

## 📊 Employee Routing (data/employees.json)
```
Domain → Specialist
IAM → John Doe (john@company.com)
Hardware → Mike Johnson
```

## 🚀 Extensibility
- Add domains/keywords in `classifyProblem()`
- Integrate real backend (replace fetch → API)
- ML classification (swap keywords → model)
- Email integration (use ../Downloads/send_emails.py)

**Production-ready SPA!** Zero dependencies, offline-first.
