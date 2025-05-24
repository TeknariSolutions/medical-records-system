import { Observable } from "rxjs";
import { PaginatorDTO } from "../../DTOs/common/paginator/paginator.dto";
import { ResponseDTO } from "../../DTOs/common/response/response.dto";

export interface IRolesService {
  GetListRoles(paginator: PaginatorDTO, description?: string): Observable<ResponseDTO>;
}
