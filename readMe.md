Beatcode – System Design Document 

1. Problem Statement

> Design and implement an online coding platform that allows users to securely write, execute, and submit code across multiple programming languages. The system must safely handle untrusted code execution, support authenticated user workflows, scale with increasing submission volume, and maintain strict separation between execution, business logic, and persistence layers.


2. High-Level Architecture

> Beatcode follows a distributed, service-oriented architecture where the application backend orchestrates authentication, problem management, and submission workflows, while code execution is delegated to a dedicated sandboxed execution service.

> Core Components:
    • Client (SPA)
    • Backend API Server (Node.js + Express)
    • Execution Engine (Judge0)
    • Data Store (MongoDB)
    • Session Store (Redis)


3. Request & Data Flow

> Code Submission Flow
    • Client submits source code and problem identifier.
    • Backend validates authentication and request payload.
    • Backend retrieves test cases and execution metadata.
    • Execution request is dispatched to Judge0.
    • Judge0 evaluates code in an isolated environment.
    • Results are aggregated by the backend.
    • Submission metadata and verdict are persisted.
    • Sanitized response is returned to the client.

> This flow ensures that no user code ever executes within the application server boundary.

4. Authentication & Authorization Design

> The authentication system uses a hybrid stateless + stateful approach:
    • JWT for request-level authentication
    • Redis for session tracking and token invalidation

> Key Design Decisions:
    • Avoid reliance on JWT expiration alone
    • Support immediate logout and session revocation
    • Enforce authorization at API boundaries
    • Centralize sensitive workflows (email verification, password resets)

> This design enables horizontal scaling while retaining strong session control guarantees.


5. Code Execution Isolation Strategy

> Running arbitrary user code presents significant security and resource risks. To mitigate this, Beatcode integrates with Judge0, a production-grade code execution platform.

> Execution Guarantees:
    • No direct execution on backend servers
    • Language-agnostic execution support
    • Isolation from host system resources
    • Prevention of malicious system calls

> Trade-Offs:
    • External dependency on Judge0 availability
    • Rate limits on free-tier execution
    • Optimized batching of test cases to reduce request overhead

> This approach significantly reduces operational complexity while maintaining strong safety guarantees.


6. Data Modeling & Storage Strategy

> The data layer is designed using domain-driven schema separation.

> Core Schemas:
    • User
    • Problem
    • Submission

> Design Principles:
    • No tightly coupled schemas
    • Relationships via references, not embedding
    • Write-optimized submission storage
    • Backend-enforced referential integrity

> This structure supports high submission throughput and simplifies future schema evolution.

7. API Design & Backend Organization

> The backend exposes RESTful APIs organized by domain boundaries.
    • Architectural Layers:
    • Routing Layer
    • Controller Layer
    • Service Layer

> Guarantees:
    • Input validation at multiple layers
    • Authorization before business logic execution
    • Consistent error handling and response contracts
    • Backend as the single source of truth

> This layered approach improves maintainability, testability, and fault isolation.


8. Frontend Model

> The frontend is built using React (SPA).

> Responsibilities:
    • Collect user input
    • Render backend-derived state
    • Submit intent-based requests
    • Explicit Non-Responsibilities:

> Note:
All security-critical decisions are handled server-side.


12. Summary

> Beatcode demonstrates a production-oriented system design that emphasizes security, isolation, scalability, and maintainability. The platform mirrors architectural patterns used by large-scale coding platforms, providing a strong foundation for real-world competitive programming or technical assessment systems.
