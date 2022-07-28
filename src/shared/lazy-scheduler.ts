const TimeIncrement = 7 * 1e-3; // Time increment in seconds

type Task = () => void;

export class LazyScheduler {
    private running = false;
    private inTasks = false;
    private queue: Task[] = [];

    public queueTask(task: Task): void {
        this.queue.push(task);

        if (this.running) return;

        this.running = true;
        const connection = game.GetService('RunService').Stepped.Connect((t, deltaT) => {
            if (this.inTasks) {
                return;
            }
            this.inTasks = true;

            if (this.queue.isEmpty()) {
                connection.Disconnect();
                this.inTasks = false;
                this.running = false;
                return;
            }

            const startMs = os.clock();
            while (os.clock() - startMs < TimeIncrement) {
                const task = this.queue.shift();
                if (task === undefined) break;
                task();
            }
            this.inTasks = false;
        });
    }
}
