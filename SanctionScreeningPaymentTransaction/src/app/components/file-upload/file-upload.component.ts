import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FileUploadService } from './file-upload.service';
@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  displayedColumns: string[] = [];
  displayedColumnsHeaders: string[] = [];
  dataSource = new MatTableDataSource<any>([]);
  originalDataSource = new MatTableDataSource<any>([]);
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];
  loading=false;
  isError=false;
  

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('searchingFilter')
  searchingFilter!: ElementRef;
  
  filters: any;
    filterKeys: any;
    reducer = (accumulator: boolean, currentValue: boolean) => accumulator && currentValue;

    constructor(private http: HttpClient, private router: Router,private fileUploadService :FileUploadService) {
        this.filters = {};
        this.dataSource.filterPredicate = this.setupFilter();

    }
  
  ngOnInit(){
    this.loading = !this.loading;
    this.displayedColumns="transactionRef,status,date,payee,payeeAccount,payer,payerAccount,amout".split(',');
     
    this.getTransactionList();
  }

  getTransactionList(){
    this.fileUploadService.getTransactionList().subscribe(
      (event: any) => {
          if (typeof (event) === 'object') {
            /*
            const results: any[] = [];
            const columns = this.displayedColumns;
            for (let i = 1; i < event.length; i++) {
              const obj: any = {};
        
              for (let j = 0; j < columns.length; j++) {
                obj[this.displayedColumns[j]] = columns[j];
              }
        
              results.push(obj);

            }
            */
            this.dataSource.data = event;
            this.originalDataSource.data=event;
            setTimeout(() => {
              if(this.paginator){
              this.paginator.pageIndex = 0; // Reset the pageIndex to 0
              this.paginator.pageSize = this.pageSize; // Manually set the pageSize to the desired value
              this.paginator.length = event.length;
              this.getPaginatedData();
              }
            }, 1000);
              this.loading = false; // Flag variable 
          }
      }
  );
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    this.isError=false;
    if(file.type!== 'text/csv'){
      const element= document.getElementById('UploadFile') as HTMLInputElement;
      element.value ='';
      this.isError=true;
      return ;
    }
    this.loading = !this.loading;
        console.log(file);
        this.fileUploadService.upload(file).subscribe(
            (event: any) => {
                if (typeof (event) === 'object') {
                    alert("File Uploaded Sucessfully");
                    this.getTransactionList();
                    this.loading = false; // Flag variable 
                }
            }
        );
  }
  
  applyFilter() {
    let column: string='status';
    let filterValue =this.searchingFilter.nativeElement.value; 
    
    // if (!this.filters[column]) {
    //     this.filters[column] = ""
    // }
    // this.filters[column] = filterValue;
    // this.filterKeys = Object.keys(this.filters)
    // this.dataSource.filter =  JSON.stringify(this.filters);
    this.dataSource.data= this.originalDataSource.data.filter(row=> row.status.toLowerCase().includes(filterValue.toLowerCase())).map(role=>role);
}
setupFilter() {
  return (d: any, filter: string) => {
      let conditions: any;
      conditions = [];
      this.filterKeys.forEach((filterKey: string) => { 
          conditions.push(this.searchString(d[filterKey], this.filters[filterKey]))
      });

      return conditions.reduce(this.reducer);
  };
}
searchString(columnValue: string, filterVales: string) {
  const textToSearch = columnValue && columnValue.toLowerCase() || ''; 
  return textToSearch.indexOf(filterVales.toLowerCase() ) !== -1;
}
  validateTansaction() {
    this.loading = !this.loading;
        this.fileUploadService.validateTransactions().subscribe(
            (event: any) => {
                if (typeof (event) === 'object') {
                    alert("Validated Sucessfully");
                    this.getTransactionList();
                    this.loading = false; // Flag variable 
                }
            }
        );
  }

  screenTansaction() {
    this.loading = !this.loading;
        this.fileUploadService.screenTransactions().subscribe(
            (event: any) => {
                if (typeof (event) === 'object') {
                    alert("Screened Sucessfully");
                    this.getTransactionList();
                    this.loading = false; // Flag variable 
                }
            }
        );
  }
  
  saveDataToDatabase() {
    // Here implement the logic to save the data to the database
    // using the HttpClient or any other method you prefer
    console.log('Saving data to the database:', this.dataSource.data);
  }

  validateData() {
    // Add validation logic here
    // This method will be triggered when the "Validate" button is clicked
    console.log('Validating data:', this.dataSource.data);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.getPaginatedData();
  }

  getPaginatedData(): any[] {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.dataSource.data.slice(startIndex, endIndex);
  }

  navigateToValidate() {
    this.router.navigateByUrl('/validate');
  }

  
}