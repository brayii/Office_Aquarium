class OfficeAquariumSystems{
  constructor(){
    this.runtime=new SimulationRuntimeSystem();
    this.projects=new ProjectPortfolioSystem();
    this.customers=new CustomerMarketSystem();
    this.workforce=new WorkforceSystem();
    this.learning=new InstitutionalLearningSystem();
    this.intelligence=new CompanyIntelligenceSystem();
    this.market=new MarketValuationSystem();
    this.ui=new UserInterfaceSystem();
    this.validation=new ValidationToolsSystem();
  }
}

const officeSystems=new OfficeAquariumSystems();
