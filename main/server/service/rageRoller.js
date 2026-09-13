import { LoggerFactory } from "./loggerFactory.js";

class RageRoller {
    constructor(diceRoller) {
        this.diceRoller = diceRoller;
        this.logger = LoggerFactory.createLogger("RageRoller");
    }

    roll({ dice, difficulty = 6, rage, target = 1 }) {

        if (!rage) {
            return this.diceRoller.roll(dice, difficulty);
        }

        if (rage >= dice) {
            const rageResult = this.diceRoller.roll(rage, difficulty);
            const isBrutal = rageResult.ones + rageResult.twos > 1;
            const result = isBrutal
                ? "Brutal"
                : (rageResult.successes < target ? "Failure" : `Success (${rageResult.successes})`);
            return {
                ...rageResult,
                rolls: [],
                rageRolls: rageResult.rolls,
                result
            };
        }

        const regularResult = this.diceRoller.roll(dice - rage, difficulty);
        const rageResult = this.diceRoller.roll(rage, difficulty);
        const isBrutal = rageResult.ones + rageResult.twos > 1;
        const successes = regularResult.successes + rageResult.successes;
        const failures = dice - successes;
        const ones = regularResult.ones + rageResult.ones;
        const twos = regularResult.twos + rageResult.twos;

        const result = isBrutal
            ? "Brutal"
            : (successes < target ? "Failure" : `Success (${successes})`);

        return {
            dice,
            difficulty,
            rolls: regularResult.rolls,
            rageRolls: rageResult.rolls,
            successes,
            failures,
            ones,
            twos,
            result
        };
    }
}

export { RageRoller };