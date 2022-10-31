export type DistinctType<T, N> = T & {
    /** Internal Type; do not use */
    __DISTINCT_PRIMITIVE__: N;
};
