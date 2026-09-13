import { LoggerFactory } from "../service/loggerFactory.js";

class DiceRoller {
    constructor() {
        this.logger = LoggerFactory.createLogger("DiceRoller");
    }

    roll(dice, difficulty = 6, target = 1) {

        const rolls = Array.from({length: dice}, (_, i) => 1 + Math.floor(Math.random() * 10));
        const tens = rolls.filter((roll) => roll === 10).length;
        const successes = rolls.filter((roll) => roll >= difficulty).length + (Math.floor(tens / 2));
        const failures = dice - successes;
        const ones = rolls.filter((roll) => roll === 1).length;
        const twos = rolls.filter((roll) => roll === 2).length;
        const result = successes < target ? "Total Failure" : `Success (${successes})`;
        
        return {
            dice,
            difficulty,
            rolls,
            successes,
            failures,
            ones, twos,
            result
        };
    }
}

export { DiceRoller };