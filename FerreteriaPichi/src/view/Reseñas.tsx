import { useState, useEffect, useRef } from "react";
import "./css/Sobrenosotros.css";

const reseñas = [
  {
    usuario: "Ricardo Pohl",
    // ... (rest of array is unchanged, I just need to target the top)

    calificacion: "5.0",
    tiempo: "Hace 2 meses",
    fecha_iso: "2025-10-05T04:33:42.090Z",
    comentario:
      "Conseguí todo lo que necesitaba,me asesoraron y atendieron cordialmente.\nTiene todos los medios de pago y los precios realmente inigualables.\nLo recomiendo",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJvhn1vPXQHRv8iq5mRHSWNfXwlbm_sCzVjFrGk8UVmsQPYkQ=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 2 meses",
  },
  {
    usuario: "Maria Lorena Ghironi",
    calificacion: "5.0",
    tiempo: "Hace 6 meses",
    fecha_iso: "2025-06-05T04:33:42.090Z",
    comentario: "Excelente atención, buenos precios",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJaZsfyradUPLC47JFbuKy5iYDnfpP2n53QYYOf4la-V8bWMw=s64-c-rp-mo-br100",
    relative_time_description: "Hace 6 meses",
  },
  {
    usuario: "Marcelo Muñoz",
    calificacion: "2.0",
    tiempo: "Hace 8 meses",
    fecha_iso: "2025-04-05T04:33:42.090Z",
    comentario:
      "Ajusten en el horario, la gente viene de lejos por qué confía en el horario, y se encuentran que 18:20 está cerrado.",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXQxIrgSc6zguRuBFcxD2KyuT3Wbh07pVNv_QolIUpmEasoW_V_=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 8 meses",
  },
  {
    usuario: "Alejandro Lioi",
    calificacion: "5.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:42.090Z",
    comentario:
      "Muy buena atención, atendido por sus dueños, excelentes precios y muy buenos productos recomendable",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocKLCyXrLXFpfh3vlN5i09ZwzO5mUF6Gh-wl9PB-JM0dphnD7A=s64-c-rp-mo-ba2-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "RUBEN CARLOS ALBERTO MANCINO ACOSTA",
    calificacion: "4.0",
    tiempo: "Hace 2 años",
    fecha_iso: "2023-12-05T04:33:44.730Z",
    comentario: "Muy buena atención hay variedad de productos",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJxFvIOHCZ5cSko0m_Pg0tlL7tOAK2q-vOMQt7ZX2oUA4qYDg=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Hace 2 años",
  },
  {
    usuario: "Filippo C",
    calificacion: "4.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.730Z",
    comentario:
      "Cuenta con muchos artículos. Atienden bien y cumple los horarios de atención ya que he ido muchas veces sobre la.hora y estaba abierto. Recomendable",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXINEkxQIZWB7R_g_DSXewPGb5L4v-fz-4rtsxk8zQFSioTLMUYCA=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "J 8532 M",
    calificacion: "5.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.730Z",
    comentario: "Excelente atención y muy buenos precios, recomendable.",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJV-G0fjKYuVC-gTaOz_QX0vEWxS-pRRIQUBoP59INAAS96Sg=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Roberto Altamirano",
    calificacion: "5.0",
    tiempo: "Editado Hace 9 meses",
    fecha_iso: "2025-03-05T04:33:44.730Z",
    comentario:
      "Para quien lea mi opinión, COMPRUEBE LA PARA QUE VEA QUE ES LA MEJOR DE ZÁRATE",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocLnJGub0sojRJiCCR-w4M-eGSGlRsSGTckA6sM4vn6UByRiCQ=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Editado Hace 9 meses",
  },
  {
    usuario: "Edgardo Guidi",
    calificacion: "5.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.730Z",
    comentario:
      "Precios!! precios!!! muy muy buenos!!! Atención excente por sus dueños!!! Ferretería de barrio.. es diciembre 2020 ...pandemia bien controlada...",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWR7Fk9YCxPcyAdccSpMYYEJCEEiRTubpjcAnhvJpRFlXXSVBA=s64-c-rp-mo-ba2-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "marcelo malek",
    calificacion: "4.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.730Z",
    comentario:
      "Excelente atencion. Calidad. Opcion de un mismo articulos. Precio",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJG4I29R59oTM4wv-xv5bSJMkLtOWSS6GSMo2dCOcf1YrCiVMnq=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "JM",
    calificacion: "5.0",
    tiempo: "Hace 7 años",
    fecha_iso: "2018-12-05T04:33:44.730Z",
    comentario:
      "El negocio está bien ubicado, hay variedad de productos y se vende a un precio más económico que otros comercios del mismo rubro. Aceptan tarjetas.",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXysKa7m3SvbENNs2YofjDuLQ09oOJ2laNhWgwQpjokqp3Aw-Yh=s64-c-rp-mo-br100",
    relative_time_description: "Hace 7 años",
  },
  {
    usuario: "Ricardo Pohl",
    calificacion: "5.0",
    tiempo: "Hace 2 meses",
    fecha_iso: "2025-10-05T04:33:44.730Z",
    comentario:
      "Conseguí todo lo que necesitaba,me asesoraron y atendieron cordialmente.\nTiene todos los medios de pago y los precios realmente inigualables.\nLo recomiendo",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJvhn1vPXQHRv8iq5mRHSWNfXwlbm_sCzVjFrGk8UVmsQPYkQ=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 2 meses",
  },
  {
    usuario: "Maria Lorena Ghironi",
    calificacion: "5.0",
    tiempo: "Hace 6 meses",
    fecha_iso: "2025-06-05T04:33:44.730Z",
    comentario: "Excelente atención, buenos precios",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJaZsfyradUPLC47JFbuKy5iYDnfpP2n53QYYOf4la-V8bWMw=s64-c-rp-mo-br100",
    relative_time_description: "Hace 6 meses",
  },
  {
    usuario: "Marcelo Muñoz",
    calificacion: "2.0",
    tiempo: "Hace 8 meses",
    fecha_iso: "2025-04-05T04:33:44.730Z",
    comentario:
      "Ajusten en el horario, la gente viene de lejos por qué confía en el horario, y se encuentran que 18:20 está cerrado.",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXQxIrgSc6zguRuBFcxD2KyuT3Wbh07pVNv_QolIUpmEasoW_V_=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 8 meses",
  },
  {
    usuario: "Alejandro Lioi",
    calificacion: "5.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.730Z",
    comentario:
      "Muy buena atención, atendido por sus dueños, excelentes precios y muy buenos productos recomendable",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocKLCyXrLXFpfh3vlN5i09ZwzO5mUF6Gh-wl9PB-JM0dphnD7A=s64-c-rp-mo-ba2-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "RUBEN CARLOS ALBERTO MANCINO ACOSTA",
    calificacion: "4.0",
    tiempo: "Hace 2 años",
    fecha_iso: "2023-12-05T04:33:44.730Z",
    comentario: "Muy buena atención hay variedad de productos",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJxFvIOHCZ5cSko0m_Pg0tlL7tOAK2q-vOMQt7ZX2oUA4qYDg=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Hace 2 años",
  },
  {
    usuario: "Filippo C",
    calificacion: "4.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.730Z",
    comentario:
      "Cuenta con muchos artículos. Atienden bien y cumple los horarios de atención ya que he ido muchas veces sobre la.hora y estaba abierto. Recomendable",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXINEkxQIZWB7R_g_DSXewPGb5L4v-fz-4rtsxk8zQFSioTLMUYCA=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "J 8532 M",
    calificacion: "5.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.730Z",
    comentario: "Excelente atención y muy buenos precios, recomendable.",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJV-G0fjKYuVC-gTaOz_QX0vEWxS-pRRIQUBoP59INAAS96Sg=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Roberto Altamirano",
    calificacion: "5.0",
    tiempo: "Editado Hace 9 meses",
    fecha_iso: "2025-03-05T04:33:44.730Z",
    comentario:
      "Para quien lea mi opinión, COMPRUEBE LA PARA QUE VEA QUE ES LA MEJOR DE ZÁRATE",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocLnJGub0sojRJiCCR-w4M-eGSGlRsSGTckA6sM4vn6UByRiCQ=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Editado Hace 9 meses",
  },
  {
    usuario: "Edgardo Guidi",
    calificacion: "5.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.730Z",
    comentario:
      "Precios!! precios!!! muy muy buenos!!! Atención excente por sus dueños!!! Ferretería de barrio.. es diciembre 2020 ...pandemia bien controlada...",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWR7Fk9YCxPcyAdccSpMYYEJCEEiRTubpjcAnhvJpRFlXXSVBA=s64-c-rp-mo-ba2-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "marcelo malek",
    calificacion: "4.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.730Z",
    comentario:
      "Excelente atencion. Calidad. Opcion de un mismo articulos. Precio",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJG4I29R59oTM4wv-xv5bSJMkLtOWSS6GSMo2dCOcf1YrCiVMnq=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "JM",
    calificacion: "5.0",
    tiempo: "Hace 7 años",
    fecha_iso: "2018-12-05T04:33:44.730Z",
    comentario:
      "El negocio está bien ubicado, hay variedad de productos y se vende a un precio más económico que otros comercios del mismo rubro. Aceptan tarjetas.",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXysKa7m3SvbENNs2YofjDuLQ09oOJ2laNhWgwQpjokqp3Aw-Yh=s64-c-rp-mo-br100",
    relative_time_description: "Hace 7 años",
  },
  {
    usuario: "Daniel H",
    calificacion: "4.0",
    tiempo: "Hace 2 años",
    fecha_iso: "2023-12-05T04:33:44.730Z",
    comentario: "Buena atención surtido de artículos nada más..",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXAhHNbd0NpLeewEWGIpr5zPv_jFpxmXXT8Qniy-KIinACqkHjYog=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 2 años",
  },
  {
    usuario: "Eduardo Juan Tripodi",
    calificacion: "3.0",
    tiempo: "Hace 6 años",
    fecha_iso: "2019-12-05T04:33:44.730Z",
    comentario:
      "No son una hemorrajia de simpatia peeero hasta lo que se, buena atencion y muy completa, bien!",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjVql3bOZCppA_lgQQJ29PhTIjVFq9aarmUjYt0XcnYIKJ90yJ4B=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 6 años",
  },
  {
    usuario: "R medina",
    calificacion: "3.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.730Z",
    comentario: "Buena. Atencion y ay de td lo q vuscas.",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocIhLHAfuPCsbDSg1n5K_TEmWqpJsbE_DLFO12NyOC14YUSClg=s64-c-rp-mo-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Alejandro.Eduardo Lopez",
    calificacion: "5.0",
    tiempo: "Hace 6 años",
    fecha_iso: "2019-12-05T04:33:44.730Z",
    comentario: "Exelente atención personalizada precios accesibles",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjUS2VSDxyerzCHjszyH86WEbpFxqDtXr5Qd_4DFGlQtQevMqhNryg=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Hace 6 años",
  },
  {
    usuario: "Fabian Felici",
    calificacion: "5.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.730Z",
    comentario: "Buena atención los látex excelente calidad . Muy recomendable",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocL5gvyMz0XvWngJLxn30yG-zkWa41Nx3MqdVfDDbYm69bOl5g=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "ruben garcia",
    calificacion: "5.0",
    tiempo: "Hace 6 años",
    fecha_iso: "2019-12-05T04:33:44.730Z",
    comentario:
      "Buena atención buenos precios. Y un gran surtido de herramientas y artículos de ferretería",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWEZxHa4h2QNH85z4LQ3kHFx7E1AuPPyqShyrNgydeCI2z0_PKs=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 6 años",
  },
  {
    usuario: "Jorge",
    calificacion: "5.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.730Z",
    comentario: "Muy surtido y buena atención",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWmVZz17m63Et8Y5HMXFLn-no0ZY5II5omXiZ5X4VQyEVocwq3Cmw=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "MICAELA",
    calificacion: "3.0",
    tiempo: "Hace 6 años",
    fecha_iso: "2019-12-05T04:33:44.730Z",
    comentario:
      "Tienen variedad ,sólo que a veces es.Un poco chocante la atención",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocL9bYvRQy2QNmmq6SWbdvBo4tbUq0sdtQ3s8F2fqZIl528s8Q=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 6 años",
  },
  {
    usuario: "Hugo Roldan",
    calificacion: "5.0",
    tiempo: "Hace 6 años",
    fecha_iso: "2019-12-05T04:33:44.730Z",
    comentario: "Tiene casi todo y buen precio",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocIjHGlsoyiFHBr5wD3vttvSnZabiveMhrXkd9nFh42Xl38emQ=s64-c-rp-mo-br100",
    relative_time_description: "Hace 6 años",
  },
  {
    usuario: "German Perez",
    calificacion: "3.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.730Z",
    comentario: "No vende caño de agua por metro, pero tiene todo",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjUyiL0o2Je_37XWjUFvr02qfIXlKkWd12Tcfj4oPlqeyT-ACl4=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Juan Carballo",
    calificacion: "3.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.730Z",
    comentario: "Local familiar, grande, amplio surtido",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocITgC1EFV5px5Li0VQW-uelK1dpIrMUvtFdBmE4VHPBj1sirgAG=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Carlos Lapalma",
    calificacion: "5.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.730Z",
    comentario: "Muy buena atención.",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWrL8NGXRJW8jTfaOzl81qGK_7ybBPX5U71cefWwdHfWGttVIR8=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Gustavo Soliño",
    calificacion: "5.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.730Z",
    comentario: "Buena atención! Tienen de todo",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjU-2Yf6mDWBxs9xyfzvluyqHZmYH0cbnLgaUKdwkPNIDQM9BcAb=s64-c-rp-mo-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Mauricio Martinese",
    calificacion: "4.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.730Z",
    comentario: "Tiene variedad de accesorios. Recomendable",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjW_ku_Ni3aHtMtyfYpfMVI_y-9Fa4h2yKT1QftOvHaySPLqG7O5ag=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Eduardo Poggio",
    calificacion: "3.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.730Z",
    comentario: "Precios buenos. Mal carácter en atencion",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocKTHZ-B1tMer-yNoV53p-_wbCdYyPNFc6RNMd_RI9ozqZL2tA=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Gustavo Fochesato",
    calificacion: "5.0",
    tiempo: "Hace 6 años",
    fecha_iso: "2019-12-05T04:33:44.730Z",
    comentario: "Muy bien el lugar encontre lo que precisaba",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJnzLLWA96ZFIgCTr4We-jqEdzPwdLMrT5Cx8JGA2hrrHCONA=s64-c-rp-mo-ba2-br100",
    relative_time_description: "Hace 6 años",
  },
  {
    usuario: "Luis Riquelme",
    calificacion: "4.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.730Z",
    comentario: "Mario tiene de todo además muy barato y de calidad",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocIdVEQkB5Hee7IUbSBi71TltIuLfFZhSOJwBzBSv3tHvSIbyQ=s64-c-rp-mo-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Brian Joel Basualdo",
    calificacion: "5.0",
    tiempo: "Hace 7 años",
    fecha_iso: "2018-12-05T04:33:44.730Z",
    comentario: "Excelente, buen servicio, buen trato.",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocKDmkbrSm_IXmqylySWAeI_Eny3Q01cwkqcdlvwqiO1SR0B1VU=s64-c-rp-mo-ba2-br100",
    relative_time_description: "Hace 7 años",
  },
  {
    usuario: "maximiliano midon",
    calificacion: "2.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.730Z",
    comentario: "Pocas ganas de atender...",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXmmeyHkUZNdyW2tCOBndiyNjrk1f3mh4njMW-siCPlg8sSrbw=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Susana Beatriz Gonzalez",
    calificacion: "5.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "Siempre enontras lo que presisas",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocKNV9nUj27oxyT1azIjxbm2aTAsSTYiH7dgReQWS97LA2YfSw=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "dany chavo",
    calificacion: "5.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "Podés encontrar todo para pintar tu casa",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocKU5NkiUHQjT1oNlLbSt2TLA-zmFXMwV-HbIomF0_F7htPG4Q=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Paisfabiana@gmail.com Pais",
    calificacion: "5.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "Muy buena atencion",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocKJyp-nKm2UbBB4FFn45tCL3UHAt7NFdeCE0a_tjBzpJJb6Zw=s64-c-rp-mo-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Rubén Benjamín Kahl",
    calificacion: "4.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.731Z",
    comentario: "Buena atencion y asesoramiento.",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWulIMmyJCrwD7Bh85RTrlnBZmov5WH9Sf8ATCQVJ1NGZ7WgtXOSA=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Mario",
    calificacion: "4.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "Muy completo , acepta solo efectivo",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWevgnumL9zGD4tr-YAEeBbYU0OW9EDe8wjIM6X33M_RcW-eoU=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Diego Pasaban",
    calificacion: "1.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "Me atendió de mala gana...😐",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWrzPU8P1uMtaE_eCYCMWP9kqsQLDe8hO_oHkOeWRTa4zn23Lo2=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Jose Antonio Herrera",
    calificacion: "5.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.731Z",
    comentario: "Excelente atencion",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWGiVcSwh5IeLM2yjjdriLFGyo9qT-5qrKEnX3HlCSRfOh-iPQzRg=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Adrian Hernandez",
    calificacion: "2.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.731Z",
    comentario: "No me gusta la atención",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocKth302J3mEl1w6srkJf-Ddy27lonl_zu9r0ZzEDNFBnoXEIg=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Damian Gonzalez",
    calificacion: "4.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "Un lugar que conseguis lo que necesitas",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjU8aENrZFJKxarL-hVv7pSbqFCFeetJhPQ0MKbknjTYxoz_Fui6qw=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Martin _Pala",
    calificacion: "4.0",
    tiempo: "Hace 8 años",
    fecha_iso: "2017-12-05T04:33:44.731Z",
    comentario: "Tiene de todo",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWBYQoeiVqYefgWm-1ZJ2uS9StW3CtxLtKftxstKLcPFJXRKJd4=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 8 años",
  },
  {
    usuario: "walter gustavo Cabeza",
    calificacion: "4.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "Buena atención",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjVzy6v3l2lelUB9oY4l7Asyg0qZl_EnQpcThoCmxs0BN4STD8Q=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Alejandro Falcon",
    calificacion: "1.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "Malo",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocI8CGZHUaofRcdIlV657D-kCootxjJXd6FkzYM7cHv4oc9Asg=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "MrCarvalen",
    calificacion: "4.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "Buenos precios!!!",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjUmw3XjWRzrGkkBKVShDyzoGfSOqUKlpj_LmMw4TJOY5GmEzYn8=s64-c-rp-mo-ba5-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Caty Piris",
    calificacion: "5.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "Super la atencion",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjVV8VazhwbVbhWhaTn6s2l7uIxpD-FjCi8378pbC2ipmi9WcNbQ5A=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "alfredo arguello",
    calificacion: "5.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "Todo los productos de ferretería",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJDr1dPg8t1gV6Ql_Bc279fBAvq4hgHuPaamLsi81ZpyEpFFg=s64-c-rp-mo-ba2-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Andres Laserna",
    calificacion: "5.0",
    tiempo: "Hace 6 años",
    fecha_iso: "2019-12-05T04:33:44.731Z",
    comentario: "Excelente",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjVR3l2jBZTLoNuophY4VRnriKQTTcOnJLguHVK3iU-jmIlMpDGSjg=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 6 años",
  },
  {
    usuario: "Juan Carlos Goncalves Diax",
    calificacion: "5.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "Excelente atencion.!!!",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocLUl7cy0m3LbT_TA224Gq-XhXFvQyMjWd-PAdT2GUMdxkb6QQ=s64-c-rp-mo-ba2-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Ram Reynoso “Raymon”",
    calificacion: "5.0",
    tiempo: "Hace 6 años",
    fecha_iso: "2019-12-05T04:33:44.731Z",
    comentario: "👍",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXLA7ksktirKLF_97cyNTmXY3KByu5E7qkKJ010CGMe0P7BdHrYEw=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 6 años",
  },
  {
    usuario: "Morena Nuñes",
    calificacion: "4.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "Buena atención",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocKsXy1oWGSrG6JZ2AVYq3kBnIFGqX667o4FsqecE1PG2AbUbQ=s64-c-rp-mo-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "David Marchini",
    calificacion: "5.0",
    tiempo: "Hace 6 años",
    fecha_iso: "2019-12-05T04:33:44.731Z",
    comentario: "Mi juguetería predilecta",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXs8omBksFjru8eilVaKlQImWwxoRxzGovIg4D-nefHZffvs6k=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 6 años",
  },
  {
    usuario: "Marcelo Crespo",
    calificacion: "5.0",
    tiempo: "Editado Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "de primeraaaaa",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJ-xOmj9ElWiugIYoR6SlWP-jn4R-RopwdtcPpFPfa1leKMQw=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Editado Hace 5 años",
  },
  {
    usuario: "Osmar David Cabrera",
    calificacion: "1.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "Mala predisposición",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocKAE5_TWyxWbssVSdTS4lkWXcFUzr76y77myhenZtAqm7Z4SA=s64-c-rp-mo-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Sebastián Noberto González",
    calificacion: "5.0",
    tiempo: "Hace 2 días",
    fecha_iso: "2025-12-03T04:33:44.731Z",
    comentario:
      "Buena atención, asesoramiento y siempre consigo accesorios de grifería que en otros lugares no tienen. Recomiendo!",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWGikbdMMweIBvAOs-DauHaORZlHv-vkO5tW0pg68w0MhNikL64Yg=s64-c-rp-mo-br100",
    relative_time_description: "Hace 2 días",
  },
  {
    usuario: "Martin Ghiselli",
    calificacion: "4.0",
    tiempo: "Editado Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "Buenos precios",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXH8i2zPk-LZM88vEwtXSyZroWuFcA6PZkvp5YeKPVIDK9ghONU0A=s64-c-rp-mo-ba2-br100",
    relative_time_description: "Editado Hace 5 años",
  },
  {
    usuario: "Juan Chena",
    calificacion: "5.0",
    tiempo: "Hace 5 años",
    fecha_iso: "2020-12-05T04:33:44.731Z",
    comentario: "Un capo Mario",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocLByqagdKda8nVuAWdara48Pk8Vb2ODpExSPmowNXCWT1LvSA=s64-c-rp-mo-ba2-br100",
    relative_time_description: "Hace 5 años",
  },
  {
    usuario: "Marcelo Atadía",
    calificacion: "5.0",
    tiempo: "Hace 7 meses",
    fecha_iso: "2025-05-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocLjYAQUMlpW7hSTFNaU_P0H41PsVYC_URCZ_jPgOkdbVB3Yvg=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 7 meses",
  },
  {
    usuario: "Gabriel Labro",
    calificacion: "5.0",
    tiempo: "Hace un año",
    fecha_iso: "2024-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXJ-pnnFWU31Xho66mZoAAq6zITTANadnGexfQx0eAwjjxI_nz4_Q=s64-c-rp-mo-br100",
    relative_time_description: "Hace un año",
  },
  {
    usuario: "Silvina Schiavo",
    calificacion: "5.0",
    tiempo: "Hace 2 años",
    fecha_iso: "2023-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocIyzaHnHouTKMzeIZOZWhj7jd21ClfnBRaGm_KFNypzbGjskQ=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 2 años",
  },
  {
    usuario: "Carmen Maria Frettes",
    calificacion: "5.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocIKcFKXJ0e-Mc22C6Hay_mnmUHQake1naQiKjnakvGmQ6xkKQ=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Ines Cerrudo",
    calificacion: "5.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocId4JriRyQSFaNnsErvj9kITOme4NNIMViY7-FDmQFOZZx0jFP6=s64-c-rp-mo-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Oscar Butazzi",
    calificacion: "2.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXpqCOoiR3ARN1-hU562WUejqs8hny1D56nR1hGBxqnY_aT3JAN=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Matias Vergara",
    calificacion: "1.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjUGpAq5nAQKWedLml83QgCjwfPZRBGeBUDXDHi9KYhOri8ES85K=s64-c-rp-mo-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Matias Plana",
    calificacion: "5.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjXCgUKPTFE_0JCf90Xlt6rARQYDQDF8fc7_v1TZ56KaOL08OEmN=s64-c-rp-mo-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Jose Daniel Mannara",
    calificacion: "5.0",
    tiempo: "Hace 3 años",
    fecha_iso: "2022-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJqS7cHR3wtzgxB1saROB7s9Z4F_C8SGDTWlWyDZb7vhbg2kg=s64-c-rp-mo-br100",
    relative_time_description: "Hace 3 años",
  },
  {
    usuario: "Nicolas Burgos",
    calificacion: "5.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjWEhQYKSSMBQH7h91g6PhZGYdgP2b2SVlNUGMSgpya0AEbWSSxuCg=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Valeria Godoy",
    calificacion: "4.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjV03Amy6JFvbtfUwtMSUlIpHTZf1OcWJrilMxD62qUY0gZbvqxw9Q=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Diego Escobar",
    calificacion: "5.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjX7210EIhWO4_RXqGTZ_PqNhE6Lg8D1NEbRY8enaQbejx6qubO3rw=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Sergio de Zárate Sergio",
    calificacion: "5.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjVX6x0iljo5StFjagsmlJOUCfwlYQkUGAMtBVkOoS3DFsU4g2yD=s64-c-rp-mo-ba3-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Guillermo Saldaña",
    calificacion: "5.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJT4x0CsvOGP7jPz4MJojS700xYnlx4olsZvGjW4m09l-751Q=s64-c-rp-mo-ba4-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Gabriel Aguilar",
    calificacion: "4.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a/ACg8ocJbhkOpkixOnQN8FWs8feoL5-6gGf2MeU_oZvRJ7CCAQhX7eg=s64-c-rp-mo-br100",
    relative_time_description: "Hace 4 años",
  },
  {
    usuario: "Emanuel Colaso",
    calificacion: "5.0",
    tiempo: "Hace 4 años",
    fecha_iso: "2021-12-05T04:33:44.731Z",
    comentario: "",
    imagen:
      "https://lh3.googleusercontent.com/a-/ALV-UjU9z5Kie-r-zSNlqhnAsQtN3U5Zij_S-f_HlL7xyM4MnhUk1mOJ=s64-c-rp-mo-br100",
    relative_time_description: "Hace 4 años",
  },
];

export default function ReviewsComponent() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reseñasVisibles = reseñas.filter(
    (r) => r.comentario && r.comentario.trim() !== ""
  );
  const totalReviews = reseñasVisibles.length;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else {
        setItemsPerPage(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, 4000);

    return () => {
      resetTimeout();
    };
  }, [currentIndex, itemsPerPage]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= totalReviews - itemsPerPage ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? totalReviews - itemsPerPage : prevIndex - 1
    );
  };

  const renderStars = (calificacion: string) => {
    const rating = parseFloat(calificacion);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <span key={i} className="star filled">
            ★
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="star">
            ★
          </span>
        );
      }
    }
    return stars;
  };

  return (
    <div className="reviews-carousel-container">
      <div className="reviews-carousel">
        <button className="carousel-control prev" onClick={prevSlide}>
          &#10094;
        </button>

        <div className="reviews-track-container">
          <div
            className="reviews-track"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
            }}
          >
            {reseñasVisibles.map((reseña, index) => (
              <div
                key={index}
                className="review-card-wrapper"
                style={{
                  flex: `0 0 ${100 / itemsPerPage}%`,
                  maxWidth: `${100 / itemsPerPage}%`,
                }}
              >
                <div className="review-card google-style">
                  <div className="review-header">
                    {reseña.imagen ? (
                      <img
                        src={reseña.imagen}
                        alt={reseña.usuario}
                        className="review-avatar"
                        style={{
                          backgroundColor: "transparent",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="review-avatar">
                        {reseña.usuario.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="review-info">
                      <h3 className="review-user">{reseña.usuario}</h3>
                      <span className="review-meta">
                        {reseña.relative_time_description}
                      </span>
                    </div>
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                      alt="Google"
                      className="google-icon"
                    />
                  </div>
                  <div className="review-rating-row">
                    <div className="review-stars">
                      {renderStars(reseña.calificacion)}
                    </div>
                  </div>
                  {reseña.comentario && reseña.comentario.trim() !== "" && (
                    <p className="review-text">{reseña.comentario}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="carousel-control next" onClick={nextSlide}>
          &#10095;
        </button>
      </div>
    </div>
  );
}
