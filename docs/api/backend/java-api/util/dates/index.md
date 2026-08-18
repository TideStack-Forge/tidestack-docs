# Dates

日期操作工具类，提供了日期类型转换以及运算方法。

Maven 包：`com.ouroboros:ouroboros-util`

Java 包：`com.ouroboros.util`

| 方法                                                                                                                               | 返回值类型    | 说明                                       |
| ---------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------ |
| [toLocalDateTime(Date date)](#tolocaldatetimedate-date)                                                                            | LocalDateTime | 将 Date 转换为 LocalDateTime               |
| [toLocalDateTime(Instant instant)](#tolocaldatetimeinstant-instant)                                                                | LocalDateTime | 将 Instant 转换为 LocalDateTime            |
| [toLocalDateTime(LocalDate date, int hour, int minute, int second)](#tolocaldatetimelocaldate-date-int-hour-int-minute-int-second) | LocalDateTime | 将 LocalDate 转换为 LocalDateTime          |
| [toLocalDateTime(LocalDate date)](#tolocaldatetimelocaldate-date)                                                                  | LocalDateTime | 将 LocalDate 转换为 LocalDateTime          |
| [toLocalDateTime(Number timestamp)](#tolocaldatetimenumber-timestamp)                                                              | LocalDateTime | 将时间戳转换为 LocalDateTime               |
| [toLocalDateTime(CharSequence dateString)](#tolocaldatetimecharsequence-datestring)                                                | LocalDateTime | 将日期字符串转换为 LocalDateTime           |
| [toLocalDateTime(CharSequence dateString, CharSequence... formats)](#tolocaldatetimecharsequence-datestring-charsequence-formats)  | LocalDateTime | 将指定格式的日期字符串转换为 LocalDateTime |
| [toLocalDate(Date date)](#tolocaldatedate-date)                                                                                    | LocalDate     | 将 Date 类型转换为 LocalDate               |
| [toLocalDate(LocalDateTime date)](#tolocaldatelocaldatetime-date)                                                                  | LocalDate     | 将 LocalDateTime 类型转换为 LocalDate      |
| [toLocalDate(Number timestamp)](#tolocaldatenumber-timestamp)                                                                      | LocalDate     | 将时间戳转换为 LocalDate                   |
| [toLocalDate(CharSequence dateString)](#tolocaldatecharsequence-datestring)                                                        | LocalDate     | 将字符串转换为 LocalDate                   |
| [toLocalDate(CharSequence dateString, CharSequence... formats)](#tolocaldatecharsequence-datestring-charsequence-formats)          | LocalDate     | 将指定格式的日期字符串转换为 LocalDate     |
| [toLocalTime(Date date)](#tolocaltimedate-date)                                                                                    | LocalTime     | 将 Date 转换为 LocalTime                   |
| [toLocalTime(LocalDateTime date)](#tolocaltimelocaldatetime-date)                                                                  | LocalTime     | 将 LocalDateTime 转换为 LocalTime          |
| [toLocalTime(Number timestamp)](#tolocaltimenumber-timestamp)                                                                      | LocalTime     | 将时间戳转换为 LocalTime                   |
| [toLocalTime(CharSequence dateString)](#tolocaltimecharsequence-datestring)                                                        | LocalTime     | 将日期字符串转换为 LocalTime               |
| [toLocalTime(CharSequence dateString, CharSequence... formats)](#tolocaltimecharsequence-datestring-charsequence-formats)          | LocalTime     | 将指定格式的日期字符串转换为 LocalTime     |
| [toDate(LocalDateTime date)](#todatelocaldatetime-date)                                                                            | Date          | 将 LocalDateTime 转换为 Date 对象          |
| [toDate(LocalDate date)](#todatelocaldate-date)                                                                                    | Date          | 将 LocalDate 转换为 Date 对象              |
| [toDate(Number timestamp)](#todatenumber-timestamp)                                                                                | Date          | 将时间戳转换为 Date                        |
| [toDate(CharSequence dateString)](#todatecharsequence-datestring)                                                                  | Date          | 将日期字符串转换为 Date 对象               |
| [toDate(CharSequence dateString, CharSequence... formats)](#todatecharsequence-datestring-charsequence-formats)                    | Date          | 将指定格式的日期字符串转换为 Date          |
| [toString(LocalDateTime date)](#tostringlocaldatetime-date)                                                                        | String        | 返回 ISO-8601 格式日期时间字符串           |
| [toString(LocalDate date)](#tostringlocaldate-date)                                                                                | String        | 返回 ISO-8601 格式日期字符串               |
| [toString(Date date)](#tostringdate-date)                                                                                          | String        | 返回 ISO-8601 格式日期字符串               |
| [toString(LocalDateTime date, String format)](#tostringlocaldatetime-date-string-format)                                           | String        | 按照指定格式将日期时间转换为字符串         |
| [toString(LocalDate date, String format)](#tostringlocaldate-date-string-format)                                                   | String        | 按照指定格式将日期时间转换为字符串         |
| [toString(Date date, String format)](#tostringdate-date-string-format)                                                             | String        | 按照指定格式将日期时间转换为字符串         |
| [addTime(LocalDateTime date, int hours, int minutes, int seconds)](#addtimelocaldatetime-date-int-hours-int-minutes-int-seconds)   | LocalDateTime | 返回增加时间后的新日期时间                 |
| [addTime(Date date, int hours, int minutes, int seconds)](#addtimedate-date-int-hours-int-minutes-int-seconds)                     | Date          | 返回增加时间后的新日期时间                 |
| [setTime(LocalDateTime date, int hours, int minutes, int seconds)](#settimelocaldatetime-date-int-hours-int-minutes-int-seconds)   | LocalDateTime | 返回某日期指定时间的对象                   |
| [setTime(Date date, int hours, int minutes, int seconds)](#settimedate-date-int-hours-int-minutes-int-seconds)                     | Date          | 返回某日期指定时间的对象                   |
| [addDays(Date date, int days)](#adddaysdate-date-int-days)                                                                         | Date          | 返回增加天数后的新日期                     |
| [getTimestamp()](#gettimestamp)                                                                                                    | Long          | 返回当前时间戳（13 位，即毫秒级）          |
| [getTimestamp(Date date)](#gettimestampdate-date)                                                                                  | Long          | 获取时间戳（13 位，即毫秒级）              |
| [getTimestamp(LocalDateTime date)](#gettimestamplocaldatetime-date)                                                                | Long          | 获取时间戳（13 位，即毫秒级）              |
| [getTimestamp(LocalDate date)](#gettimestamplocaldate-date)                                                                        | Long          | 获取时间戳（13 位，即毫秒级）              |
| [getUnixTimestamp()](#getunixtimestamp)                                                                                            | Long          | 获取当前 UNIX 时间戳（10 位，即秒级）      |
| [getUnixTimestamp(Date date)](#getunixtimestampdate-date)                                                                          | Long          | 获取 UNIX 时间戳（10 位，即秒级）          |
| [getUnixTimestamp(LocalDateTime date)](#getunixtimestamplocaldatetime-date)                                                        | Long          | 获取 UNIX 时间戳（10 位，即秒级）          |
| [getUnixTimestamp(LocalDate date)](#getunixtimestamp-localdate-date)                                                               | Long          | 获取 UNIX 时间戳（10 位，即秒级）          |
| [getYearStartDay(LocalDate date)](#getyearstartday-localdate-date)                                                                 | LocalDate     | 获取指定日期当年第一天的日期               |
| [getYearEndDay(LocalDate date)](#getyearendday-localdate-date)                                                                     | LocalDate     | 获取指定日期当年的最后一天的日期           |
| [getYearStart(LocalDateTime date)](#getyearstart-localdatetime-date)                                                               | LocalDateTime | 获取指定日期当年第一天 0 时的日期时间      |
| [getYearEnd(LocalDateTime date)](#getyearend-localdatetime-date)                                                                   | LocalDateTime | 获取指定日期当年最后一天最后一刻的日期时间 |
| [getMonthStartDay(LocalDate date)](#getmonthstartday-localdate-date)                                                               | LocalDate     | 获取指定日期当月第一天的日期               |
| [getMonthEndDay(LocalDate date)](#getmonthendday-localdate-date)                                                                   | LocalDate     | 获取指定日期当月最后一天的日期             |
| [getMonthStart(LocalDateTime date)](#getmonthstart-localdatetime-date)                                                             | LocalDateTime | 获取指定日期当月第一天 0 时的日期时间      |
| [getMonthEnd(LocalDateTime date)](#getmonthend-localdatetime-date)                                                                 | LocalDateTime | 获取指定日期当月最后一天最后一刻的日期时间 |
| [getWeekStartDay(LocalDate date)](#getweekstartday-localdate-date)                                                                 | LocalDate     | 获取指定日期当周周一的日期                 |
| [getWeekEndDay(LocalDate date)](#getweekendday-localdate-date)                                                                     | LocalDate     | 获取指定日期当周周日的日期                 |
| [getWeekStart(LocalDateTime date)](#getweekstart-localdatetime-date)                                                               | LocalDateTime | 获取指定日期当周周一的日期时间             |
| [getWeekEnd(LocalDateTime date)](#getweekend-localdatetime-date)                                                                   | LocalDateTime | 获取指定日期当周周日的日期时间             |
| [getDayStart(LocalDateTime date)](#getdaystart-localdatetime-date)                                                                 | LocalDateTime | 获取指定日期的开始时间                     |
| [getDayEnd(LocalDateTime date)](#getdayend-localdatetime-date)                                                                     | LocalDateTime | 获取指定日期的结束时间                     |
| [getThisYearStart()](#getthisyearstart)                                                                                            | LocalDateTime | 获取今年第一天开始时间                     |
| [getThisYearEnd()](#getthisyearend)                                                                                                | LocalDateTime | 获取今年最后一天最后一刻                   |
| [getThisMonthStart()](#getthismonthstart)                                                                                          | LocalDateTime | 获取当前月第一天的开始日期时间             |
| [getThisMonthEnd()](#getthismonthend)                                                                                              | LocalDateTime | 获取当前月最后一天最后一刻                 |
| [getTodayStart()](#gettodaystart)                                                                                                  | LocalDateTime | 获取今天最开始的日期时间                   |
| [getTodayEnd()](#gettodayend)                                                                                                      | LocalDateTime | 获取今天最后一刻                           |
| [getLastYearStart()](#getlastyearstart)                                                                                            | LocalDateTime | 获取去年第一天开始时间                     |
| [getLastYearEnd()](#getlastyearend)                                                                                                | LocalDateTime | 获取去年最后一天的最后一刻                 |
| [getLastMonthStart(LocalDate date)](#getlastmonthstart-localdate-date)                                                             | LocalDateTime | 获取指定日期上个月的第一天的开始时间       |
| [getLastMonthStart(LocalDateTime date)](#getlastmonthstart-localdatetime-date)                                                     | LocalDateTime | 获取指定日期上个月的第一天的开始时间       |
| [getLastMonthEnd(LocalDate date)](#getlastmonthend-localdate-date)                                                                 | LocalDateTime | 获取指定日期上个月的最后一天的最后一刻     |
| [getLastMonthEnd(LocalDateTime date)](#getlastmonthend-localdatetime-date)                                                         | LocalDateTime | 获取指定日期上个月的最后一天的最后一刻     |
| [getThisWeekday(LocalDate date, Integer weekday)](#getthisweekday-localdate-date-integer-weekday)                                  | LocalDate     | 获取指定日期当周指定天                     |
| [getThisWeekday(LocalDateTime date, Integer weekday)](#getthisweekday-localdatetime-date-integer-weekday)                          | LocalDate     | 获取指定日期当周指定星期几                 |
| [getNextWeekday(LocalDate date, Integer weekday)](#getnextweekday-localdate-date-integer-weekday)                                  | LocalDate     | 获取指定日期的下一个星期几（当周或下周）   |
| [getPrevWeekday(LocalDate date, Integer weekday)](#getprevweekday-localdate-date-integer-weekday)                                  | LocalDate     | 获取指定日期上个星期几（当周或上周）       |
| [getNextWeekday(Integer weekday)](#getnextweekday-integer-weekday)                                                                 | LocalDate     | 获取下一个周几（本周或下周）               |
| [getPrevWeekday(Integer weekday)](#getprevweekday-integer-weekday)                                                                 | LocalDate     | 获取上一个周几（本周或上周）               |
| [today()](#today)                                                                                                                  | LocalDate     | 获取当前日期                               |
| [now()](#now)                                                                                                                      | LocalDateTime | 获取当前日期时间                           |
| [getCurrentDate()](#getcurrentdate)                                                                                                | Date          | 获取当前日期时间                           |

## 方法

### toLocalDateTime(Date date)

**方法签名**

```java
public static LocalDateTime toLocalDateTime(Date date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ---- | -------------------- |
| date | Date | 需要转换的 Date 对象 |

**返回值**

返回一个 `LocalDateTime` 实例。

### toLocalDateTime(Instant instant)

**方法签名**

```java
public static LocalDateTime toLocalDateTime(Instant instant)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | ------- | ----------------------- |
| instant | Instant | 需要转换的 Instant 对象 |

**返回值**

返回一个 `LocalDateTime` 实例。

### toLocalDateTime(LocalDate date, int hour, int minute, int second)

**方法签名**

```java
public static LocalDateTime toLocalDateTime(LocalDate date, int hour, int minute, int second)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ------------------------- |
| date | LocalDate | 需要转换的 LocalDate 对象 |
| hour | int | 时 |
| minute | int | 分 |
| second | int | 秒 |

**返回值**

返回一个 `LocalDateTime` 实例。

### toLocalDateTime(LocalDate date)

**方法签名**

```java
public static LocalDateTime toLocalDateTime(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ------------------------- |
| date | LocalDate | 需要转换的 LocalDate 对象 |

**返回值**

返回一个 `LocalDateTime` 实例。

### toLocalDateTime(Number timestamp)

**方法签名**

```java
public static LocalDateTime toLocalDateTime(Number timestamp)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| --------- | ------ | ---------------- |
| timestamp | Number | 需要转换的时间戳 |

**返回值**

返回一个 `LocalDateTime` 实例。

### toLocalDateTime(CharSequence dateString)

**方法签名**

```java
public static LocalDateTime toLocalDateTime(CharSequence dateString)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ---------- | ------------ | -------------------- |
| dateString | CharSequence | 需要转换的日期字符串 |

**返回值**

若解析失败则返回 `LocalDateTime.MIN`，否则返回一个 `LocalDateTime` 实例。

### toLocalDateTime(CharSequence dateString, CharSequence... formats)

**方法签名**

```java
public static LocalDateTime toLocalDateTime(CharSequence dateString, CharSequence... formats)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ---------- | --------------- | -------------------- |
| dateString | CharSequence | 需要转换的日期字符串 |
| formats | CharSequence... | 日期字符串的可能格式 |

**返回值**

若解析失败则返回 `LocalDateTime.MIN`，否则返回一个 `LocalDateTime` 实例。

### toLocalDate(Date date)

**方法签名**

```java
public static LocalDate toLocalDate(Date date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ---- | -------------------- |
| date | Date | 需要转换的 Date 对象 |

**返回值**

返回一个 `LocalDate` 实例。

### toLocalDate(LocalDateTime date)

**方法签名**

```java
public static LocalDate toLocalDate(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ----------------------------- |
| date | LocalDateTime | 需要转换的 LocalDateTime 对象 |

**返回值**

返回一个 `LocalDate` 实例。

### toLocalDate(Number timestamp)

**方法签名**

```java
public static LocalDate toLocalDate(Number timestamp)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| --------- | ------ | ---------------- |
| timestamp | Number | 需要转换的时间戳 |

**返回值**

返回一个 `LocalDate` 实例。

### toLocalDate(CharSequence dateString)

**方法签名**

```java
public static LocalDate toLocalDate(CharSequence dateString)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ---------- | ------------ | -------------------- |
| dateString | CharSequence | 需要转换的日期字符串 |

**返回值**

若解析失败则返回 `LocalDate.MIN`，否则返回一个 `LocalDate` 实例。

### toLocalDate(CharSequence dateString, CharSequence... formats)

**方法签名**

```java
public static LocalDate toLocalDate(CharSequence dateString, CharSequence... formats)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ---------- | --------------- | -------------------- |
| dateString | CharSequence | 需要转换的日期字符串 |
| formats | CharSequence... | 日期字符串的可能格式 |

**返回值**

若解析失败则返回 `LocalDate.MIN`，否则返回一个 `LocalDate` 实例。

### toLocalTime(Date date)

**方法签名**

```java
public static LocalTime toLocalTime(Date date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ---- | -------------------- |
| date | Date | 需要转换的 Date 对象 |

**返回值**

返回一个 `LocalTime` 实例。

### toLocalTime(LocalDateTime date)

**方法签名**

```java
public static LocalTime toLocalTime(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ----------------------------- |
| date | LocalDateTime | 需要转换的 LocalDateTime 对象 |

**返回值**

返回一个 `LocalTime` 实例。

### toLocalTime(Number timestamp)

**方法签名**

```java
public static LocalTime toLocalTime(Number timestamp)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| --------- | ------ | ---------------- |
| timestamp | Number | 需要转换的时间戳 |

**返回值**

返回一个 `LocalTime` 实例。

### toLocalTime(CharSequence dateString)

**方法签名**

```java
public static LocalTime toLocalTime(CharSequence dateString)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ---------- | ------------ | -------------------- |
| dateString | CharSequence | 需要转换的日期字符串 |

**返回值**

若解析失败则返回 `LocalTime.MIN`，否则返回一个 `LocalTime` 实例。

### toLocalTime(CharSequence dateString, CharSequence... formats)

**方法签名**

```java
public static LocalTime toLocalTime(CharSequence dateString, CharSequence... formats)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ---------- | --------------- | -------------------- |
| dateString | CharSequence | 需要转换的日期字符串 |
| formats | CharSequence... | 日期字符串的可能格式 |

**返回值**

若解析失败则返回 `LocalTime.MIN`，否则返回一个 `LocalTime` 实例。

### toDate(LocalDateTime date)

**方法签名**

```java
public static Date toDate(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ----------------------------- |
| date | LocalDateTime | 需要转换的 LocalDateTime 对象 |

**返回值**

返回一个 `Date` 实例。

### toDate(LocalDate date)

**方法签名**

```java
public static Date toDate(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ------------------------- |
| date | LocalDate | 需要转换的 LocalDate 对象 |

**返回值**

返回一个 `Date` 实例。

### toDate(Number timestamp)

**方法签名**

```java
public static Date toDate(Number timestamp)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| --------- | ------ | ---------------- |
| timestamp | Number | 需要转换的时间戳 |

**返回值**

返回一个 `Date` 实例。

### toDate(CharSequence dateString)

**方法签名**

```java
public static Date toDate(CharSequence dateString)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ---------- | ------------ | -------------------- |
| dateString | CharSequence | 需要转换的日期字符串 |

**返回值**

返回一个 `Date` 实例。

### toDate(CharSequence dateString, CharSequence... formats)

**方法签名**

```java
public static Date toDate(CharSequence dateString, CharSequence... formats)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ---------- | --------------- | -------------------- |
| dateString | CharSequence | 需要转换的日期字符串 |
| formats | CharSequence... | 日期字符串的可能格式 |

**返回值**

返回一个 `Date` 实例。

### toString(LocalDateTime date)

**方法签名**

```java
String toString(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ---------------------- |
| date | LocalDateTime | 需要转换的日期时间对象 |

**返回值**

返回一个 `String` 实例，表示日期时间的 ISO-8601 格式字符串。

### toString(LocalDate date)

**方法签名**

```java
String toString(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ------------------ |
| date | LocalDate | 需要转换的日期对象 |

**返回值**

返回一个 `String` 实例，表示日期的 ISO-8601 格式字符串。

### toString(Date date)

**方法签名**

```java
String toString(Date date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ---- | ---------------------- |
| date | Date | 需要转换的日期时间对象 |

**返回值**

返回一个 `String` 实例，表示日期时间的 ISO-8601 格式字符串。

### toString(LocalDateTime date, String format)

**方法签名**

```java
String toString(LocalDateTime date, String format)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ---------------------- |
| date | LocalDateTime | 需要转换的日期时间对象 |
| format | String | 日期时间的格式 |

**返回值**

返回一个 `String` 实例，表示按照指定格式转换的日期时间字符串。

### toString(LocalDate date, String format)

**方法签名**

```java
String toString(LocalDate date, String format)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ------------------ |
| date | LocalDate | 需要转换的日期对象 |
| format | String | 日期的格式 |

**返回值**

返回一个 `String` 实例，表示按照指定格式转换的日期字符串。

### toString(Date date, String format)

**方法签名**

```java
String toString(Date date, String format)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------ | ---------------------- |
| date | Date | 需要转换的日期时间对象 |
| format | String | 日期时间的格式 |

**返回值**

返回一个 `String` 实例，表示按照指定格式转换的日期时间字符串。

### addTime(LocalDateTime date, int hours, int minutes, int seconds)

**方法签名**

```java
LocalDateTime addTime(LocalDateTime date, int hours, int minutes, int seconds)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | ------------- | -------------------------- |
| date | LocalDateTime | 需要增加时间的日期时间对象 |
| hours | int | 需要增加的小时数 |
| minutes | int | 需要增加的分钟数 |
| seconds | int | 需要增加的秒数 |

**返回值**

返回一个 `LocalDateTime` 实例，表示增加指定时间后的日期时间。

### addTime(Date date, int hours, int minutes, int seconds)

**方法签名**

```java
Date addTime(Date date, int hours, int minutes, int seconds)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | ---- | -------------------------- |
| date | Date | 需要增加时间的日期时间对象 |
| hours | int | 需要增加的小时数 |
| minutes | int | 需要增加的分钟数 |
| seconds | int | 需要增加的秒数 |

**返回值**

返回一个 `Date` 实例，表示增加指定时间后的日期时间。

### setTime(LocalDateTime date, int hours, int minutes, int seconds)

**方法签名**

```java
LocalDateTime setTime(LocalDateTime date, int hours, int minutes, int seconds)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | ------------- | -------------------------- |
| date | LocalDateTime | 需要设置时间的日期时间对象 |
| hours | int | 需要设置的小时数 |
| minutes | int | 需要设置的分钟数 |
| seconds | int | 需要设置的秒数 |

**返回值**

返回一个 `LocalDateTime` 实例，表示设置指定时间后的日期时间。

### setTime(Date date, int hours, int minutes, int seconds)

**方法签名**

```java
Date setTime(Date date, int hours, int minutes, int seconds)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | ---- | -------------------------- |
| date | Date | 需要设置时间的日期时间对象 |
| hours | int | 需要设置的小时数 |
| minutes | int | 需要设置的分钟数 |
| seconds | int | 需要设置的秒数 |

**返回值**

返回一个 `Date` 实例，表示设置指定时间后的日期时间。

### addDays(Date date, int days)

**方法签名**

```java
Date addDays(Date date, int days)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ---- | ---------------------- |
| date | Date | 需要增加天数的日期对象 |
| days | int | 需要增加的天数 |

**返回值**

返回一个 `Date` 实例，表示增加指定天数后的日期。

### getTimestamp()

**方法签名**

```java
Long getTimestamp()
```

**参数说明**
无

**返回值**

返回一个 `Long` 实例，表示当前时间的时间戳（13 位，即毫秒级）。

### getTimestamp(Date date)

**方法签名**

```java
Long getTimestamp(Date date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ---- | ------------------------ |
| date | Date | 需要获取时间戳的日期对象 |

**返回值**

返回一个 `Long` 实例，表示指定日期的时间戳（13 位，即毫秒级）。

### getTimestamp(LocalDateTime date)

**方法签名**

```java
Long getTimestamp(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ---------------------------- |
| date | LocalDateTime | 需要获取时间戳的日期时间对象 |

**返回值**

返回一个 `Long` 实例，表示指定日期时间的时间戳（13 位，即毫秒级）。

### getTimestamp(LocalDate date)

**方法签名**

```java
Long getTimestamp(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ------------------------ |
| date | LocalDate | 需要获取时间戳的日期对象 |

**返回值**

返回一个 `Long` 实例，表示指定日期的时间戳（13 位，即毫秒级）。

### getUnixTimestamp()

**方法签名**

```java
Long getUnixTimestamp()
```

**参数说明**
无

**返回值**

返回一个 `Long` 实例，表示当前时间的 UNIX 时间戳（10 位，即秒级）。

### getUnixTimestamp(Date date)

**方法签名**

```java
Long getUnixTimestamp(Date date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ---- | ------------------------------ |
| date | Date | 需要获取 UNIX 时间戳的日期对象 |

**返回值**

返回一个 `Long` 实例，表示指定日期的 UNIX 时间戳（10 位，即秒级）。

### getUnixTimestamp(LocalDateTime date)

**方法签名**

```java
Long getUnixTimestamp(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ---------------------------------- |
| date | LocalDateTime | 需要获取 UNIX 时间戳的日期时间对象 |

**返回值**

返回一个 `Long` 实例，表示指定日期时间的 UNIX 时间戳（10 位，即秒级）。

### getUnixTimestamp(LocalDate date) {#getunixtimestamp-localdate-date}

**方法签名**

```java
Long getUnixTimestamp(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ------------------------------ |
| date | LocalDate | 需要获取 UNIX 时间戳的日期对象 |

**返回值**

返回一个 `Long` 实例，表示指定日期的 UNIX 时间戳（10 位，即秒级）。

### getYearStartDay(LocalDate date) {#getyearstartday-localdate-date}

**方法签名**

```java
LocalDate getYearStartDay(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ---------------------------- |
| date | LocalDate | 需要获取当年第一天的日期对象 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期当年第一天的日期。

### getYearStartDay(LocalDateTime date)

**方法签名**

```java
LocalDate getYearStartDay(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | -------------------------------- |
| date | LocalDateTime | 需要获取当年第一天的日期时间对象 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期时间当年第一天的日期。

### getYearEndDay(LocalDate date) {#getyearendday-localdate-date}

**方法签名**

```java
LocalDate getYearEndDay(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ------------------------------ |
| date | LocalDate | 需要获取当年最后一天的日期对象 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期当年最后一天的日期。

### getYearEndDay(LocalDateTime date)

**方法签名**

```java
LocalDate getYearEndDay(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ---------------------------------- |
| date | LocalDateTime | 需要获取当年最后一天的日期时间对象 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期时间当年最后一天的日期。

### getYearStart(LocalDateTime date) {#getyearstart-localdatetime-date}

**方法签名**

```java
LocalDateTime getYearStart(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ------------------------------------- |
| date | LocalDateTime | 需要获取当年第一天 0 时的日期时间对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期时间当年第一天 0 时的日期时间。

### getYearStart(LocalDate date)

**方法签名**

```java
LocalDateTime getYearStart(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | --------------------------------- |
| date | LocalDate | 需要获取当年第一天 0 时的日期对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期当年第一天 0 时的日期时间。

### getYearEnd(LocalDateTime date) {#getyearend-localdatetime-date}

**方法签名**

```java
LocalDateTime getYearEnd(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ------------------------------------------ |
| date | LocalDateTime | 需要获取当年最后一天最后一刻的日期时间对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期时间当年最后一天最后一刻的日期时间。

### getYearEnd(LocalDate date)

**方法签名**

```java
LocalDateTime getYearEnd(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | -------------------------------------- |
| date | LocalDate | 需要获取当年最后一天最后一刻的日期对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期当年最后一天最后一刻的日期时间。

### getMonthStartDay(LocalDate date) {#getmonthstartday-localdate-date}

**方法签名**

```java
LocalDate getMonthStartDay(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ---------------------------- |
| date | LocalDate | 需要获取当月第一天的日期对象 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期当月第一天的日期。

### getMonthEndDay(LocalDate date) {#getmonthendday-localdate-date}

**方法签名**

```java
LocalDate getMonthEndDay(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ------------------------------ |
| date | LocalDate | 需要获取当月最后一天的日期对象 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期当月最后一天的日期。

### getMonthStart(LocalDateTime date) {#getmonthstart-localdatetime-date}

**方法签名**

```java
LocalDateTime getMonthStart(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ------------------------------------- |
| date | LocalDateTime | 需要获取当月第一天 0 时的日期时间对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期时间当月第一天 0 时的日期时间。

### getMonthStart(LocalDate date)

**方法签名**

```java
LocalDateTime getMonthStart(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | --------------------------------- |
| date | LocalDate | 需要获取当月第一天 0 时的日期对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期时间当月第一天 0 时的日期时间。

### getMonthEnd(LocalDateTime date) {#getmonthend-localdatetime-date}

**方法签名**

```java
public static LocalDateTime getMonthEnd(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ------------------------------ |
| date | LocalDateTime | 需要获取月份结束时间的日期时间 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期所在月份的结束时间。

### getMonthEnd(LocalDate date)

**方法签名**

```java
public static LocalDateTime getMonthEnd(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | -------------------------- |
| date | LocalDate | 需要获取月份结束时间的日期 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期所在月份的结束时间。

### getWeekStartDay(LocalDate date) {#getweekstartday-localdate-date}

**方法签名**：`public static LocalDate getWeekStartDay(LocalDate date)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ---------------------------- |
| date | LocalDate | 需要获取当周周一的日期对象 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期当周周一的日期。

### getWeekEndDay(LocalDate date) {#getweekendday-localdate-date}

**方法签名**：`public static LocalDate getWeekEndDay(LocalDate date)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ---------------------------- |
| date | LocalDate | 需要获取当周周日的日期对象 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期当周周日的日期。

### getWeekStart(LocalDateTime date) {#getweekstart-localdatetime-date}

**方法签名**：`public static LocalDateTime getWeekStart(LocalDateTime date)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | -------------------------------- |
| date | LocalDateTime | 需要获取当周周一的日期时间对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期当周周一的日期时间。

### getWeekEnd(LocalDateTime date) {#getweekend-localdatetime-date}

**方法签名**：`public static LocalDateTime getWeekEnd(LocalDateTime date)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | -------------------------------- |
| date | LocalDateTime | 需要获取当周周日的日期时间对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期当周周日的日期时间。

### getDayStart(LocalDateTime date) {#getdaystart-localdatetime-date}

**方法签名**

```java
public static LocalDateTime getDayStart(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ---------------------- |
| date | LocalDateTime | 需要获取开始时间的日期 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期的开始时间。

### getDayStart(LocalDate date)

**方法签名**

```java
public static LocalDateTime getDayStart(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ---------------------- |
| date | LocalDate | 需要获取开始时间的日期 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期的开始时间。

### getDayEnd(LocalDateTime date) {#getdayend-localdatetime-date}

**方法签名**

```java
public static LocalDateTime getDayEnd(LocalDateTime date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ---------------------- |
| date | LocalDateTime | 需要获取结束时间的日期 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期的结束时间。

### getDayEnd(LocalDate date)

**方法签名**

```java
public static LocalDateTime getDayEnd(LocalDate date)
```

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ---------------------- |
| date | LocalDate | 需要获取结束时间的日期 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期的结束时间。

### getThisYearStart()

**方法签名**

```java
public static LocalDateTime getThisYearStart()
```

**参数说明**
无参数

**返回值**

返回一个 `LocalDateTime` 实例，表示当前年份的开始时间。

### getThisYearEnd()

**方法签名**

```java
public static LocalDateTime getThisYearEnd()
```

**参数说明**
无参数

**返回值**

返回一个 `LocalDateTime` 实例，表示当前年份的结束时间。

### getThisMonthStart()

**方法签名**

```java
public static LocalDateTime getThisMonthStart()
```

**参数说明**
无参数

**返回值**

返回一个 `LocalDateTime` 实例，表示当前月份的开始时间。

### getThisMonthEnd()

**方法签名**

```java
public static LocalDateTime getThisMonthEnd()
```

**参数说明**
无参数

**返回值**

返回一个 `LocalDateTime` 实例，表示当前月份的结束时间。

### getTodayStart()

**方法签名**

```java
public static LocalDateTime getTodayStart()
```

**参数说明**
无参数

**返回值**

返回一个 `LocalDateTime` 实例，表示今天的开始时间。

### getTodayEnd()

**方法签名**

```java
public static LocalDateTime getTodayEnd()
```

**参数说明**
无参数

**返回值**

返回一个 `LocalDateTime` 实例，表示今天的结束时间。

### getLastYearStart() {#getlastyearstart}

**方法签名**：`public static LocalDateTime getLastYearStart()`

**返回值**

返回一个 `LocalDateTime` 实例，表示去年的第一天开始时间。

### getLastYearEnd() {#getlastyearend}

**方法签名**：`public static LocalDateTime getLastYearEnd()`

**返回值**

返回一个 `LocalDateTime` 实例，表示去年的最后一天最后一刻。

### getLastMonthStart(LocalDate date) {#getlastmonthstart-localdate-date}

**方法签名**：`public static LocalDateTime getLastMonthStart(LocalDate date)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ---------------------------------- |
| date | LocalDate | 需要获取上个月开始时间的日期对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期上个月第一天的开始时间。

### getLastMonthStart(LocalDateTime date) {#getlastmonthstart-localdatetime-date}

**方法签名**：`public static LocalDateTime getLastMonthStart(LocalDateTime date)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ------------------------------------ |
| date | LocalDateTime | 需要获取上个月开始时间的日期时间对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期上个月第一天的开始时间。

### getLastMonthEnd(LocalDate date) {#getlastmonthend-localdate-date}

**方法签名**：`public static LocalDateTime getLastMonthEnd(LocalDate date)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | --------- | ---------------------------------- |
| date | LocalDate | 需要获取上个月结束时间的日期对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期上个月最后一天的最后一刻。

### getLastMonthEnd(LocalDateTime date) {#getlastmonthend-localdatetime-date}

**方法签名**：`public static LocalDateTime getLastMonthEnd(LocalDateTime date)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------ | ------------- | ------------------------------------ |
| date | LocalDateTime | 需要获取上个月结束时间的日期时间对象 |

**返回值**

返回一个 `LocalDateTime` 实例，表示指定日期上个月最后一天的最后一刻。

### getThisWeekday(LocalDate date, Integer weekday) {#getthisweekday-localdate-date-integer-weekday}

**方法签名**：`public static LocalDate getThisWeekday(LocalDate date, Integer weekday)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | --------- | ---------------------------- |
| date | LocalDate | 需要获取工作日的基准日期 |
| weekday | Integer | `1-7` 依次表示周一至周日 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期当周对应的星期几。

### getThisWeekday(LocalDateTime date, Integer weekday) {#getthisweekday-localdatetime-date-integer-weekday}

**方法签名**：`public static LocalDate getThisWeekday(LocalDateTime date, Integer weekday)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | ------------- | ---------------------------- |
| date | LocalDateTime | 需要获取工作日的基准日期时间 |
| weekday | Integer | `1-7` 依次表示周一至周日 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期时间当周对应的星期几。

### getNextWeekday(LocalDate date, Integer weekday) {#getnextweekday-localdate-date-integer-weekday}

**方法签名**：`public static LocalDate getNextWeekday(LocalDate date, Integer weekday)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | --------- | ------------------------------ |
| date | LocalDate | 需要计算下一个星期几的基准日期 |
| weekday | Integer | `1-7` 依次表示周一至周日 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期当周或下周的目标星期几。

### getPrevWeekday(LocalDate date, Integer weekday) {#getprevweekday-localdate-date-integer-weekday}

**方法签名**：`public static LocalDate getPrevWeekday(LocalDate date, Integer weekday)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | --------- | ------------------------------ |
| date | LocalDate | 需要计算上一个星期几的基准日期 |
| weekday | Integer | `1-7` 依次表示周一至周日 |

**返回值**

返回一个 `LocalDate` 实例，表示指定日期当周或上周的目标星期几。

### getNextWeekday(Integer weekday) {#getnextweekday-integer-weekday}

**方法签名**：`public static LocalDate getNextWeekday(Integer weekday)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | ------- | ------------------------ |
| weekday | Integer | `1-7` 依次表示周一至周日 |

**返回值**

返回一个 `LocalDate` 实例，表示相对今天的下一个目标星期几。

### getPrevWeekday(Integer weekday) {#getprevweekday-integer-weekday}

**方法签名**：`public static LocalDate getPrevWeekday(Integer weekday)`

**参数说明**
| 参数名 | 类型 | 说明 |
| ------- | ------- | ------------------------ |
| weekday | Integer | `1-7` 依次表示周一至周日 |

**返回值**

返回一个 `LocalDate` 实例，表示相对今天的上一个目标星期几。

### getCurrentDate()

**方法签名**

```java
public static Date getCurrentDate()
```

**参数说明**
无参数

**返回值**

返回一个 `Date` 实例，表示当前日期时间。

### today()

**方法签名**

```java
public static LocalDate today()
```

**参数说明**
无参数

**返回值**

返回一个 `LocalDate` 实例，表示今天的日期。

### now()

**方法签名**

```java
public static LocalDateTime now()
```

**参数说明**
无参数

**返回值**

返回一个 `LocalDateTime` 实例，表示当前的日期时间。
