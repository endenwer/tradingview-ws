import { connect, getCandles, getCandles2V2, } from './src/index'


(async function () {

  const data = ["TLKM","UNVR","ADRO","ICBP","ANTM","INDF","PGAS","PTBA","KLBF","WIKA","ADHI","JPFA","ITMG","MYOR","AALI","MNCN","UNTR","PTPP","CTRA","SMGR","BRIS","CPIN","PWON","BSDE","INTP","SIDO","HRUM","LPPF","SMRA","INCO","SCMA","LSIP","EXCL","KAEF","TINS","ERAA","FREN","ACES","INKP","ELSA","MDKA","TKIM","AKRA","BRPT","KIJA","ISAT","BTPS","BMTR","EMTK","ULTJ","BRMS","ASRI","INAF","DMAS","SMDR","MIKA","MAPI","GJTL","ENRG","WTON","PTRO","MPMX","RALS","TPIA","WEGE","APLN","MLPL","IRRA","SMBR","BANK","CLEO","MTDL","AGII","HOKI","AUTO","POWR","LPKR","FILM","MPPA","PNBS","DMMX","WOOD","BKSL","RAJA","BEST","ISSP","SIMP","GOOD","MAIN","WIRG","IPTV","SOCI","HEXA","NIKL","BIRD","SILO","SAME","BSSR","BOSS","EKAD","MBAP","IPCC","LINK","MBSS","SMMT","WMUU","MTEL","KPIG","DKFT","GZCO","TOTL","AISA","FPNI","FIRE","KBLI","TMAS","TSPC","ACST","CAMP","PALM","PSAB","KINO","MSIN","SMSM","LPCK","DEWA","PTSN","SSIA","JAST","DSNG","YELO","ROTI","DILD","PSSI","TAPG","KREN","JRPT","PURA","SGRO","TGRA","PRDA","JAYA","ARNA","LUCK","MERK","PEHA","MARK","DGNS","MLPT","KIOS","SLIS","MCAS","KKGI","TOYS","HEAL","ABMM","INDR","NICL","BUDI","CEKA","PPRE","BYAN","ADES","IPCM","BISI","KBAG","MMLP","REAL","CCSI","TOTO","META","TRUK","SGER","CAKK","ASGR","CSRA","COAL","MYOH","KOBX","TCPI","BEBS","ADMG","PZZA","DGIK","MAPA","FAST","MLIA","IKAN","GEMS","ESIP","WINS","TRIN","PBID","MRAT","DVLA","AYLS","SPMA","JKON","BMHS","TNCA","SOHO","BCIP","LAND","RANC","PKPK","FOOD","GDST","UCID","NELY","RBMS","NRCA","SMCB","WEHA","TECH","LTLS","MITI","TPMA","HDIT","PTDU","NFCX","IPPE","BAPA","INDX","ASHA","RIGS","PANI","MDKI","MPOW","MSKY","KOTA","HAIS","CSIS","BMSR","ZYRX","SHIP","DSFI","KEEN","AVIA","CLPI","SPTO","GPRA","HOPE","ANJT","KEJU","WIFI","PRIM","PSKT","PAMG","RODA","ITMA","HRME","KAYU","DMND","ALDO","TRUE","STTP","SAMF","CMNP","IGAR","DIVA","UNIQ","TRJA","KBLM","ARCI","OPMS","ADCP","RMKE","IPOL","APEX","ZBRA","EDGE","EPMT","BELL","BTON","DADA","EAST","BAUT","TFAS","CMRY","TOPS","COCO","ANDI","BESS","PJAA","LPIN","IKAI","INCI","ASLC","MTPS","MAPB","HERO","ARII","ICON","DRMA","CASS","UNIC","GDYR","WINR","SMDM","SICO","MCOL","DIGI","KICI","DSSA","MORA","SRAJ","TEBE","MTLA","KARW","CBMF","HATM","SCCO","BOGA","SEMA","SBMA","GWSA","BUKK","KDSI","TAMU","LABA","TCID","STAA","OILS","AMFG","GGRP","KRYA","INDS","CITA","GTSI","PCAR","MASA","IMPC","EPAC","KJEN","DWGL","ENZO","NPGF","TRIS","OBMD","AKSI","TBMS","IFII","MFMI","AXIO","TGKA","SMKL","AKPI","IDPR","MINA","BLUE","IIKP","NASI","DUTI","GOLD","VOKS","GLVA","JTPE","ATAP","TAMA","MICE","PBSA","UFOE","KIAS","CSAP","PMJS","LION","BAPI","WAPO","BBSS","NTBK","MEDS","CANI","ESTI","DPNS","LRNA","VICI","SAPX","GHON","WMPP","SKBM","MBTO","PLIN","ASPI","NZIA","IFSH","MIDI","CINT","APII","URBN","LMPI","BKDP","HITS","DEWI","AIMS","KOPI","BIPP","FITT","TMPO","BATA","CITY","BRAM","SURE","SIPD","INTD","BOLT","ALKA","TARA","SKLT","KUAS","PORT","GPSO","CRAB","YPAS","FISH","SDPC","MTMH","LMSH","SOSS","APLI","TOOL","PTPW","RISE","KONI","SHID","PGLI","MTFN","IKBI","ZONE","AMIN","BIKE","CPRI","JIHD","TRST","JECC","GAMA","MTSM","TFCO","SCNP","BLTA","SINI","BBRM","BIKA","MKPI","SCPI","KOIN","ENAK","IBST","ALMI","RDTX","SNLK","MIRA","BRNA","CTBN","SOTS","MKNT","CHEM","TURI","BAYU","ECII","FMII","OMRE","PGUN","DEPO","KMDS","DAYA","KKES","PURI","BLTZ","HOMI","BOBA","SWID","GMTD","LCKM","SSTM","PUDP","PTSP","AMAN","GEMA","JSPT","RSGK","CSMI","EMDE","AGAR","PNSE","JGLE","BINO","MGNA","TAYS","RAFI","ELPI","BUAH","GULA","JMAS"]
  try {
 
    const start = new Date().getTime();
    const connection = await connect();
    const candles = await getCandles2V2({
      connection,
      symbols: data.map(res => `IDX:${res}`),
      amount: 2,
      timeframe: "1D",
    })
    console.log(candles)
    const end = new Date().getTime();
    const time = end - start;
    console.log('Execution time: ' + time);

    connection.close()

  } catch (error) {
    console.error(error)
  }
}());

