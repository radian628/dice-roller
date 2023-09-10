export function Info() {
  return (
    <div class="info">
      <h1>Dice Roller</h1>
      <h2>Development</h2>
      <p>
        Suggestions? Questions? Bug reports? Anything else of the sort?{" "}
        <a href="https://github.com/radian628/dice-roller">
          I'd love to see your feedback on GitHub here!
        </a>
      </p>
      <h2>Examples</h2>
      <ul>
        <li>
          Roll 2d6 and add 3: <br></br>
          <code>2d6 + 3</code>
        </li>
        <li>
          Roll 2d6 and subtract 3: <br></br>
          <code>2d6 - 3</code>
        </li>
        <li>
          Roll 1d4 + 5 8 times and add them together: <br></br>
          <code>1d4 + 5 x8</code>
        </li>
        <li>
          Roll 1d4 and multiply it by 5: <br></br>
          <code>1d4 * 5</code>
        </li>
        <li>
          Roll 1d8 and divide it by 2 (rounded down): <br></br>
          <code>1d8 / 2</code>
        </li>
        <li>
          Roll 1d100: <br></br>
          <code>1d100</code>
        </li>
        <li>
          Damage types: <br></br>
          <code>1d12 slashing + 2d6 fire</code>
        </li>
        <li>
          Attack with a +5 modifier against an enemy with 13 AC, dealing 1d8+5
          slashing damage: <br></br>
          <code>attack(1d20+5, 13, 1d8+5 slashing)</code>
        </li>
        <li>
          Roll a d20 with advantage: <br></br>
          <code>adv(1d20)</code>
        </li>
        <li>
          Did I roll higher than a 3 on a d6 and less than or equal to a 4 on a
          d8?: <br></br>
          <code>1d6 &gt; 3 and 1d8 &lt;= 4</code>
        </li>
        <li>
          If I fail my +7 DEX save on the fireball, deal 8d6 fire damage.
          Instead, deal half that.<br></br>
          <code>1d20 + 7 &lt; 17 ? 8d6 fire : 8d6/2 fire</code>
        </li>
      </ul>
    </div>
  );
}
