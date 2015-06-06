interface ArrayLikeShim<T> {
    length: number;
    [n: number]: T;
}