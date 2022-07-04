const TimeIncrement = 10 * 1e-3; // Time increment in seconds

type Task = () => void;

export class LazyScheduler {
    private running = false;
    private queue: Task[] = [];

    public queueTask(task: Task): void {
        this.queue.push(task);

        if (this.running) return;

        this.running = true;
        const connection = game.GetService('RunService').Stepped.Connect((t, deltaT) => {
            if (math.random() > 0.98) print(this.queue.size());

            if (this.queue.isEmpty()) {
                connection.Disconnect();
                this.running = false;
                return;
            }

            const startMs = os.clock();
            while (os.clock() - startMs < TimeIncrement) {
                const task = this.queue.shift();
                if (task === undefined) break;
                task();
            }
        });
    }
}
