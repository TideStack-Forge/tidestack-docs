# Dates

日期转换、格式化和时间区间工具。Java 导入 `com.ouroboros.util.Dates`；脚本和表达式中可直接使用 `Dates`。

## 常用示例

```java
import java.time.LocalDate;
import com.ouroboros.util.Dates;

var date = LocalDate.of(2026, 11, 12);
String text = Dates.toString(date, "yyyy-MM-dd"); // 2026-11-12
var start = Dates.getMonthStart(date); // 2026-11-01T00:00
var nextMonth = start.plusMonths(1);  // 2026-12-01T00:00
```

查询时间范围时，可使用“包含开始，不包含下一周期开始”的条件，避免依赖数据库对毫秒、微秒或纳秒的精度：

```groovy
def start = Dates.getMonthStart(Dates.today())
def nextMonth = start.plusMonths(1)
def where = [createdAt: [greaterThanOrEqual: start, lessThan: nextMonth]]
```

## 类型转换

| 方法族 | 接受的输入 | 返回值 |
| --- | --- | --- |
| `toLocalDateTime(...)` | `Date`、`Instant`、`LocalDate`、`Number`、`CharSequence` | `LocalDateTime` |
| `toLocalDateTime(LocalDate, hour, minute, second)` | 日期与时分秒 | `LocalDateTime` |
| `toLocalDate(...)` | `Date`、`LocalDateTime`、`Number`、`CharSequence` | `LocalDate` |
| `toLocalTime(...)` | `Date`、`LocalDateTime`、`Number`、`CharSequence` | `LocalTime` |
| `toDate(...)` | `LocalDateTime`、`LocalDate`、`Number`、`CharSequence` | `Date` |

字符串转换方法还支持 `toXxx(CharSequence value, CharSequence... formats)`，按给定格式依次尝试后回退到默认解析。

```java
var time = Dates.toLocalDateTime("2026-11-12 09:30:00");
var day = Dates.toLocalDate("12/11/2026", "dd/MM/yyyy");
var clock = Dates.toLocalTime("09:30:00");
```

默认日期时间解析支持 ISO 日期时间、`yyyy-MM-dd HH:mm:ss`、日期和时间戳字符串。`Date`、`Instant` 与本地时间之间的转换使用 JVM 默认时区；`LocalDateTime` 本身不携带时区，跨时区交换数据时应明确约定。

解析失败行为需要区分：`toLocalDateTime(CharSequence)` 返回 `LocalDateTime.MIN`；日期或时间字符串的部分解析方法会抛出解析异常。不要把最小日期当作有效业务时间，也不要假定空值会被自动接受。

## 时间戳

| 方法 | 单位 / 说明 |
| --- | --- |
| `getTimestamp()` | 当前毫秒时间戳 |
| `getTimestamp(Date / LocalDateTime / LocalDate)` | 指定时间的毫秒时间戳 |
| `getUnixTimestamp()` | 当前秒时间戳 |
| `getUnixTimestamp(Date / LocalDateTime / LocalDate)` | 指定时间的秒时间戳 |

```java
long milliseconds = Dates.getTimestamp();
long seconds = Dates.getUnixTimestamp();
var time = Dates.toLocalDateTime(1_700_000_000L); // 秒输入
```

数字输入小于 `10_000_000_000` 时按秒处理，否则按毫秒处理；现代日期常见的十位秒值和十三位毫秒值可直接使用。历史日期和特殊范围的时间戳应先明确单位，避免依赖数值大小推断。

## 格式化

`toString(LocalDate / LocalDateTime / Date)` 输出 ISO 风格文本；追加 `String format` 指定格式。

```java
String day = Dates.toString(Dates.today(), "yyyyMMdd");
String timestamp = Dates.toString(Dates.now(), "yyyy-MM-dd HH:mm:ss");
```

格式符沿用 Java 日期格式，月份使用 `MM`，分钟使用 `mm`。

## 调整时间

| 方法 | 返回值 / 说明 |
| --- | --- |
| `addTime(LocalDateTime / Date, hours, minutes, seconds)` | 增加时间，返回新对象 |
| `setTime(LocalDateTime / Date, hours, minutes, seconds)` | 设置时分秒 |
| `addDays(Date date, int days)` | 增加固定的 `days × 24` 小时 |

```java
var deadline = Dates.addTime(Dates.now(), 2, 0, 0);
var executionTime = Dates.setTime(Dates.today().atStartOfDay(), 9, 0, 0);
```

`Date` 的固定时长加法与跨夏令时的日历加法含义不同。按本地日历推移日期时，可先使用 `LocalDate.plusDays(...)`。

## 周期起止

| 方法族 | 输入 / 返回 |
| --- | --- |
| `getYearStartDay` / `getYearEndDay` | `LocalDate` 或 `LocalDateTime` → `LocalDate` |
| `getYearStart` / `getYearEnd` | `LocalDate` 或 `LocalDateTime` → `LocalDateTime` |
| `getMonthStartDay` / `getMonthEndDay` | `LocalDate` → `LocalDate` |
| `getMonthStart` / `getMonthEnd` | `LocalDate` 或 `LocalDateTime` → `LocalDateTime` |
| `getWeekStartDay` / `getWeekEndDay` | `LocalDate` → `LocalDate`，周一 / 周日 |
| `getWeekStart` / `getWeekEnd` | `LocalDate` 或 `LocalDateTime` → `LocalDateTime` |
| `getDayStart` / `getDayEnd` | `LocalDate` 或 `LocalDateTime` → `LocalDateTime` |

开始时间为 `00:00:00`。年末、月末使用 `23:59:59.999`，周末、日末使用 `LocalTime.MAX`；用于数据库区间查询时优先采用下一周期开始值作为排他上界。

无参便捷方法包括 `getThisYearStart/End()`、`getThisMonthStart/End()`、`getTodayStart/End()` 和 `getLastYearStart/End()`。`getLastMonthStart/End(date)` 接受 `LocalDate` 或 `LocalDateTime`。

## 星期与当前时间

| 方法 | 说明 |
| --- | --- |
| `getThisWeekday(LocalDate / LocalDateTime, Integer weekday)` | 指定日期当周的星期几 |
| `getNextWeekday(LocalDate, Integer weekday)` | 下一个指定星期，包含当天 |
| `getPrevWeekday(LocalDate, Integer weekday)` | 按指定星期计算日期；需要严格早于当天时使用 JDK 日期调整器 |
| `getNextWeekday(Integer)` / `getPrevWeekday(Integer)` | 以今天为基准 |
| `today()` / `now()` / `getCurrentDate()` | 当前 `LocalDate` / `LocalDateTime` / `Date` |

`weekday` 为 `1` 到 `7`，分别表示周一到周日。严格寻找上一周同一天，可使用 `date.with(TemporalAdjusters.previous(DayOfWeek.MONDAY))`。
