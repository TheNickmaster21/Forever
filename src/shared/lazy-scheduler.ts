const TimeIncrement = 10 * 1e-3; // Time increment in seconds

type Task = () => void;

export class LazyScheduler {
    private running = false;
    private queue: Task[] = [];

    public queueTask(task: Task): void {
        this.queue.push(task);
    }

    public run(): void {
        if (this.running) return;
        this.running = true;

        game.GetService('RunService').Stepped.Connect((t, deltaT) => {
            if (this.queue.isEmpty()) return;

            const startMs = os.clock();
            while (os.clock() - startMs < TimeIncrement) {
                const task = this.queue.shift();
                if (task === undefined) break;
                task();
            }
        });
    }
}