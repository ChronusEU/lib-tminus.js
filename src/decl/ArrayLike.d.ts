interface ArrayLike<T> {
    length: number;
    [n: number]: T;
}