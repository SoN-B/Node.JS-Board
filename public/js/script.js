// public/js/script.js
/*client의 브라우저에서 사용하게 될 JavaScript입니다. 
그래서 public 폴더에 들어 있음*/

// $(function(){})
// DOM(Document Object Model) 객체가 생성되어 준비되는 시점에서 호출된다는 의미
$(function () {
    function get2digits(num) {
        return ("0" + num).slice(-2);
    }

    function getDate(dateObj) {
        if (dateObj instanceof Date) return dateObj.getFullYear() + "-" + get2digits(dateObj.getMonth() + 1) + "-" + get2digits(dateObj.getDate());
    }

    function getTime(dateObj) {
        if (dateObj instanceof Date) return get2digits(dateObj.getHours()) + ":" + get2digits(dateObj.getMinutes()) + ":" + get2digits(dateObj.getSeconds());
    }

    function convertDate() {
        $("[data-date]").each(function (index, element) {
            //html element중에 data-date이 있는 것을 찾습니다.
            var dateString = $(element).data("date");
            if (dateString) {
                var date = new Date(dateString);
                $(element).html(getDate(date));
            }
        });
    }
    /*data-date에 날짜데이터가 들어 있으면, 해당 데이터를 
    년-월-일의 형태로 변환해서 element의 텍스트 데이터로 넣습니다.*/
    // <span data-date="2020-01-08T20:08:24.586Z"></span>
    // <span data-date="2020-01-08T20:08:24.586Z">2020-01-08</span>

    function convertDateTime() {
        $("[data-date-time]").each(function (index, element) {
            //data-date-time을 찾아서 년-원-일 시:분:초의 형태로 변환해서 출력
            var dateString = $(element).data("date-time");
            if (dateString) {
                var date = new Date(dateString);
                $(element).html(getDate(date) + " " + getTime(date));
            }
        });
    }

    convertDate();
    convertDateTime();
});

$(function () {
    var search = window.location.search; // ?searchType=title&searchText=text
    var params = {};

    // query string -> object 변환 - IE에서 URLSearchParams사용불가
    // Chrome, Safari : URLSearchParams(https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)참고
    if (search) {
        $.each(search.slice(1).split("&"), function (index, param) {
            // ?searchType=title&searchText=text -> searchType=title&searchText=text -> searchType=title, searchText=text
            // index는 배열의 인덱스 또는 객체의 키를 의미,  param은 해당 인덱스나 키가 가진 값을 의미
            var index = param.indexOf("=");
            if (index > 0) {
                // index = 10
                var key = param.slice(0, index); // 0 ~ 9
                var value = param.slice(index + 1); // 10 ~

                if (!params[key]) params[key] = value;
                // params: {searchType: 'title', searchText: 'text'}
            }
        });
    }
    /* 
        slice() : 배열로 부터 특정 범위를 복사한 값들을 담고 있는 새로운 배열을 만드는데 사용합니다. 
        첫번째 인자로 시작 인덱스(index), 두번째 인자로 종료 인덱스를 받으며, 시작 인덱스부터 종료 인덱스까지 값을 복사하여 반환합니다.
        Ex. 두번째 인자를 넘기지 않으면, 시작 인덱스가 가리키는 값부터 배열의 마지막 값까지 모두 복사해줍니다.
    */

    // data-search-highlight의 값을 searchType과 비교하여, 일치하는 경우 searchText를 regex로 찾아 해당 텍스트에 highlighted css class를 추가
    if (params.searchText && params.searchText.length >= 3) {
        $("[data-search-highlight]").each(function (index, element) {
            // $() 함수는 선택된 HTML 요소를 제이쿼리에서 이용할 수 있는 형태로 생성
            var $element = $(element);
            var searchHighlight = $element.data("search-highlight"); // title or author
            var index = params.searchType.indexOf(searchHighlight);

            if (index >= 0) {
                var decodedSearchText = params.searchText.replace(/\+/g, " ");
                // 띄어쓰기를 공백으로 바꿈, 정규표현식의 g를 사용함으로써 일치하는 여러개의 값을 모두 찾아서 바꾼다.
                decodedSearchText = decodeURI(decodedSearchText); // 특수문자 디코딩 Ex. & -> %26

                var regex = new RegExp(`(${decodedSearchText})`, "ig"); // Ex. /(test1 test2 test3)/gi
                $element.html($element.html().replace(regex, '<span class="highlighted">$1</span>'));
                // $1 : 정규표현식에서의 () 안의 내용은 그룹화 되고, 그룹화된 내용의 첫번째 요소를 가져다 사용하는것
                // 그리고 교체된 html 요소를 $element.html()안에 넣는것
                // 결과는 검색한 제목 & 내용에 맞는 부분만 노란색 하이라이트가 적용됨
            }
        });
    }
});
