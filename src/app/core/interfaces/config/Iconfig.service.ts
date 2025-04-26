import { Observable } from "rxjs";
import { AppConfig } from "../../DTOs/common/app-config/app-config.dto";

export interface IConfigService {
  getConfig(): Observable<AppConfig>;
}
