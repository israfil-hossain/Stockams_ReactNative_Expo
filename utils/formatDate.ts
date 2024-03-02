import dayjs from 'dayjs';

export  function formatDate (date: any){
    return dayjs(date).format('DD/MM/YYYY');
}


