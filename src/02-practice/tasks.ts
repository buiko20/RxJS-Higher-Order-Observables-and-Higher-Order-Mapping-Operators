import { addItem, run } from './../03-utils';
import { catchError, mergeMap, concatMap, delay, exhaustMap, switchMap, take, filter, concatMapTo, mergeMapTo, switchMapTo, tap, map, mapTo } from 'rxjs/operators';
import { fromEvent, range, interval, of, from, Observable, NEVER, concat, timer, } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

// Task 1. concatMap()
// Реализуйте функцию, которая создает Observable, который выдает числа в диапазоне от 1 до 10 
// через случайное количество времени в диапазоне от 1с до 5с
// Используйте функцию randomDelay(), of(), concatMap(), delay()
// Проведите эксперимент заменяя метод concatMap на mergeMap, switchMap, exhaustMap
(function task1(): void {
    function randomDelay(min: number, max: number) {
        const pause = Math.floor(Math.random() * (max - min)) + min;
        console.log(pause);
        return pause;
    }

    const stream$ = range(0, 10)
        .pipe(
            concatMap(i => of(i).pipe(delay(randomDelay(1000, 5000))))
        );

    //run(stream$);
})();

// Task 2. mergeMap()
// Испольуя функцию emulateHttpCall и массив идентификаторов ids
// организуйте получение объектов в параллель.
(function task2(): void {
    function emulateHttpCall(id: number): Observable<any> {
        switch (id) {
            case 1:
                return of({ id: 1, name: 'Anna' }).pipe(delay(4000)); // <-- emulation of http call, which returns Observable after 4s
            case 2:
                return of({ id: 2, name: 'Boris' }).pipe(delay(3000)); // <-- pause 3s
            case 3:
                return of({ id: 3, name: 'Clara' }).pipe(delay(2000)); // <-- pause 2s
        }
    }

    const ids = [1, 3, 2, 2, 3, 3, 1, 2, 3];

    const stream$ = from(ids)
        .pipe(
            mergeMap(id => emulateHttpCall(id))
        );

    //run(stream$);
})();


// Task 3. switchMap()
// Создайте внешний поток, используя fromFetch('https://api.github.com/users?per_page=5')
// Создайте для результата внешнего потока внутренний поток response.json(), используя switchMap()
// Дополнительно фильтруйте элементы внешнего потока по условию response.ok === true
(function task3(): void {
    const stream$ = fromFetch('https://api.github.com/users?per_page=5')
        .pipe(
            filter(response => response.ok === true),
            switchMap(response => response.json())
        );

    //run(stream$);
})();

// Task 4. exhaustMap()
// Создайте внешний поток из событий click по кнопке runBtn.
// Во время первого клика по кнопке создайте внутренний поток, используя interval(1000)
// Элементы внутреннего потока должны попасть в выходной поток. 
// Игнорируйте все последующие клики на кнопке
(function task4() {
    const runBtn = document.getElementById('runBtn');

    const clicks$ = fromEvent(runBtn, 'click');
    const stream$ = clicks$.pipe(
        exhaustMap(event => interval(2000).pipe(take(5)))
    );

    //run(stream$);
})();


// Task 5. concatMapTo()
// Создайте внешний поток событий click по кнопке runBtn.
// Во время клика по кнопке, создайте внутренний поток из слов 
// 'Hello', 'World!', используя of() и объедините его с потоком NEVER
// Добавьте слова внутреннего потока в результирующий поток
// Обясните результат нескольких кликов по кнопке
(function task5() {
    const runBtn = document.getElementById('runBtn');
    const inner = concat(of('Hello', 'World!'), NEVER);
    const clicks$ = fromEvent(runBtn, 'click');
    const stream$ = clicks$.pipe(
        concatMapTo(inner)
    );

    //run(stream$);
})();

// Task 6. mergeMapTo()
// Задание аналогично предыдущему, только теперь вместо concatMap используйте mergeMap
// Обясните результат нескольких кликов по кнопке
(function task6() {
    const runBtn = document.getElementById('runBtn');
    const inner = concat(of('Hello', 'World!'), NEVER);
    const clicks$ = fromEvent(runBtn, 'click');
    const stream$ = clicks$.pipe(
        mergeMapTo(inner)
    );

    //run(stream$);
})();

// Task7. switchMapTo()
// Создайте внешний поток событий click по кнопке runBtn.
// Во время клика по кнопке, создайте внутренний поток, 
// который будет выдавать числа от 0 до 4 с интервалом в 1с.
// Каждый новый клик по кнопке должен начинать выдавать значения внутреннего потока 
// начииная с 0, недожидаясь завершения выдачи всех предыдущих чисел.
(function task7() {
    const runBtn = document.getElementById('runBtn');
    const clicks$ = fromEvent(runBtn, 'click');
    const inner = interval(1000).pipe(take(4));
    const stream$ = clicks$
        .pipe(
            switchMapTo(inner)
        );

    //run(stream$);
})();

// Custom Task1. switchMap
// реализуйте поиск, используя текстовое поле 'text-field'. На каждый ввод нового символа
// необходимо запускать новый запрос за поиском и предыдущий отменять.
(function customTask1() {

    function emulateHttpCall(text: string): Observable<any> {
        console.log("emulateHttpCall start");
        return of({}).pipe(delay(1000), mapTo(text), tap(() => console.log("emulateHttpCall end")));
    }

    const input: any = document.getElementById('text-field');
    const clicks$ = fromEvent(input, 'keyup');
    const stream$ = clicks$
        .pipe(
            switchMap(() => emulateHttpCall(input.value))
        );

    //run(stream$);
})();

// Custom Task2. exhaustMap
// Каждые 0.5 секунды необходимо отправлять запрос и дожидаться его завершения и только после его завершения
// отправлять следующий звапрос. Все тики, которые произошли во время "работы" запроса - пропускать.
(function customTask2() {

    function emulateHttpCall(text: string): Observable<any> {
        console.log("emulateHttpCall start");
        return of({}).pipe(delay(1500), mapTo(text), tap(() => console.log("emulateHttpCall end")));
    }

    const stream$ = interval(500)
        .pipe(
            tap(i => addItem(`interval ${i}`, { color: "red" })),
            exhaustMap(() => emulateHttpCall("http request"))
        );

    //run(stream$);
})();




export function runner() { }
