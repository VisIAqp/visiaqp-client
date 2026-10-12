import { HttpErrorResponse } from '@angular/common/http';

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.name === 'TimeoutError')
    return 'La API tardó demasiado en responder. Inténtalo de nuevo.';
  if (!(error instanceof HttpErrorResponse)) return 'No se pudo completar la operación.';
  if (error.status === 0)
    return 'No se pudo conectar con la API. Comprueba que esté disponible y permita el acceso desde este navegador.';
  if (error.status === 401 && error.error?.detail === 'Credenciales incorrectas')
    return 'Credenciales incorrectas';
  if (error.status === 401) return 'La sesión no es válida o ha expirado. Inicia sesión de nuevo.';
  if (error.status === 403) return 'No tienes permiso para realizar esta operación.';
  if (error.status >= 500) return 'El servidor no pudo completar la operación. Inténtalo de nuevo.';
  const detail = error.error?.detail;
  const clean = (s: string) => s.replace(/(\w+:\/\/)[^/\s@]+@/g, '$1***@');
  if (typeof detail === 'string') return clean(detail);
  if (error.status === 422 && Array.isArray(detail)) {
    return detail
      .map((item: { loc?: string[]; msg?: string }) => {
        const field = item.loc?.slice(1).join('.') || 'Datos';
        return field + ': ' + clean(item.msg || 'Valor inválido');
      })
      .join('. ');
  }
  return error.status === 409
    ? 'Los datos entran en conflicto con un registro existente.'
    : 'No se pudo completar la operación.';
}
