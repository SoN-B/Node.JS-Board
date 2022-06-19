// public/js/script.js
/*client의 브라우저에서 사용하게 될 JavaScript입니다. 
그래서 public 폴더에 들어 있음*/

$(function(){
function get2digits (num){
    return ('0' + num).slice(-2);
}

function getDate(dateObj){
    if(dateObj instanceof Date)
    return dateObj.getFullYear() + '-' + get2digits(dateObj.getMonth()+1)+ '-' + get2digits(dateObj.getDate());
}

function getTime(dateObj){
    if(dateObj instanceof Date)
    return get2digits(dateObj.getHours()) + ':' + get2digits(dateObj.getMinutes())+ ':' + get2digits(dateObj.getSeconds());
}

function convertDate(){
    $('[data-date]').each(function(index,element){
        //html element중에 data-date이 있는 것을 찾습니다.
        var dateString = $(element).data('date');
        if(dateString){
            var date = new Date(dateString);
            $(element).html(getDate(date));
        }
    });
}
/*data-date에 날짜데이터가 들어 있으면, 해당 데이터를 
년-월-일의 형태로 변환해서 element의 텍스트 데이터로 넣습니다.*/
// <span data-date="2020-01-08T20:08:24.586Z"></span>
// <span data-date="2020-01-08T20:08:24.586Z">2020-01-08</span>

function convertDateTime(){
    $('[data-date-time]').each(function(index,element){
        //data-date-time을 찾아서 년-원-일 시:분:초의 형태로 변환해서 출력
        var dateString = $(element).data('date-time');
        if(dateString){
            var date = new Date(dateString);
            $(element).html(getDate(date)+' '+getTime(date));
        }
    });
}

convertDate();
convertDateTime();
});