export interface Profiler {
    Begin: (arg: string) => void;
    End: () => void;
}
