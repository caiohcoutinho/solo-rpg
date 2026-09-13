export class QuickActionPersistence {
  constructor({ quickActionRepository }) {
    this.repository = quickActionRepository;
  }

  async persist(turnId, quickActions) {
    for (const action of [quickActions?.quick_action_1, quickActions?.quick_action_2]) {
      if (!action) continue;

      await this.repository.create(
        action.description,
        !!action.challenge,
        action.challenge?.reasoning,
        action.challenge?.attribute,
        action.challenge?.ability,
        action.challenge?.reward,
        action.challenge?.cost,
        turnId
      );
    }
  }
}
