# AURA Cloud Gaming Platform - Test Plan

## Test Objectives
- Validate end-to-end user flows
- Verify performance metrics (Lighthouse 98+, TTFB <200ms)
- Confirm security requirements are met
- Ensure cross-platform compatibility

## Key Test Scenarios

### Merchant Onboarding
1. 1-click Sunshine/Tailscale installer
2. Freeze/resume system for gaming machines
3. ROI calculator accuracy

### Player Experience
1. Moonlight/Tailscale auto-setup
2. Machine rating submission
3. Cross-platform UI responsiveness

### Payment Processing
1. All payment method integrations
2. Failed payment handling
3. Refund processing

### Performance
1. Load testing with 1000+ concurrent users
2. P2P connection latency
3. Auto-scaling under load

### Security
1. API endpoint authentication
2. Rate limiting effectiveness
3. Data encryption verification

### Security Tests
1. **RBAC Validation**:
   - Проверка доступа для разных ролей
   - Попытки несанкционированного доступа
2. **Secret Management**:
   - Проверка отсутствия хардкода секретов
   - Валидация работы SecretManager
3. **API Protection**:
   - Тесты rate limiting
   - Проверка security headers
4. **Authentication**:
   - Тесты на невалидные токены
   - Проверка истечения токенов

## Testing Methodology
- Automated tests: 80% coverage
- Manual exploratory testing
- Load testing with k6
- Security scanning with OWASP ZAP

## Success Criteria
- All critical bugs resolved
- Performance targets met
- Security vulnerabilities addressed
- UX satisfaction score ≥ 4.5/5
