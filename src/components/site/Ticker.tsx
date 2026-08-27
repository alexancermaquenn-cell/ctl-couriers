const ITEMS = [
  <><b>190+</b> countries served</>,
  <><b>50+</b> years of experience</>,
  <><b>99.2%</b> guaranteed on-time delivery</>,
  <>Warehouses in <b>Norway · Denmark · Spain</b></>,
  <>Available <b>24 hours · 365 days</b></>,
  <><b>SafeDeal</b> secure escrow</>,
  <>Live tracking · format <b>CTL-####-####</b></>,
];

export function Ticker() {
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__row">
        {[...ITEMS, ...ITEMS].map((node, i) => (
          <span key={i}>
            {node}
            <span className="dot" />
          </span>
        ))}
      </div>
    </div>
  );
}
