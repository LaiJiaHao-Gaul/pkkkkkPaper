class MultiArmedBandit {
    constructor(nArms, epsilon = 0.1) {
        this.nArms = nArms; // 多臂老虎机的臂数
        this.epsilon = epsilon; // 探索的概率
        this.counts = new Array(nArms).fill(0); // 每个臂被选择的次数
        this.values = new Array(nArms).fill(0.0); // 每个臂的平均奖励值
    }

    // 选择臂的方法
    selectArm() {
        if (Math.random() > this.epsilon) {
            // 利用现有知识：选择当前平均奖励值最高的臂
            return this.values.indexOf(Math.max(...this.values));
        } else {
            // 探索：随机选择一个臂
            return Math.floor(Math.random() * this.nArms);
        }
    }

    // 更新选择的臂的奖励值
    update(chosenArm, reward) {
        this.counts[chosenArm] += 1; // 更新选择次数
        const n = this.counts[chosenArm];
        const value = this.values[chosenArm];
        // 使用增量公式更新平均奖励值
        this.values[chosenArm] = ((n - 1) / n) * value + (1 / n) * reward;
    }
}

// 实例化 MAB
const mab = new MultiArmedBandit(3, 0.1);

// 如果有参数传递，更新 MAB 状态
if (process.argv.length > 2) {
    const chosenArm = parseInt(process.argv[2]);
    const reward = parseFloat(process.argv[3]);
    mab.update(chosenArm, reward);
    console.log(JSON.stringify({ message: "MAB updated successfully" }));
} else {
    // 如果没有参数，执行选择手臂
    const chosenArm = mab.selectArm();
    console.log(JSON.stringify({ chosenArm }));
}

module.exports = { MultiArmedBandit };