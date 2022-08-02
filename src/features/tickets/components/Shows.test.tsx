import userEvent from "@testing-library/user-event";

import { getByRole, getByText, render, screen } from "../../../test-utils";
import { Shows } from "./Shows";

test.skip("display relevant show details for non-sold-out show", async () => {
  // name: "Avalanche of Cheese",
  // description: "rollicking country with ambitious kazoo solos",
  render(<Shows />);
  const shows = await screen.findAllByRole("listitem");
  const nonSoldOutShow = shows[0];

  const nonSoldOutBtn = getByRole(nonSoldOutShow, "button", {
    name: /tickets/i,
  });
  expect(nonSoldOutBtn).toBeInTheDocument();

  const nonSoldOutHeading = getByRole(nonSoldOutShow, "heading", {
    name: /avalanche of cheese/i,
  });
  expect(nonSoldOutHeading).toBeInTheDocument();

  const nonSoldOutDesc = getByText(
    nonSoldOutShow,
    "rollicking country with ambitious kazoo solos"
  );
  expect(nonSoldOutDesc).toBeInTheDocument();
});

test.skip("display show details for sold-out show", async () => {
  // name: "The Joyous Nun Riot",
  // description: "serious world music with an iconic musical saw",
  render(<Shows />);
  const shows = await screen.findAllByRole("listitem");
  const soldOutShow = shows[1];

  const soldOutHeading = getByRole(soldOutShow, "heading", {
    name: /sold out/i,
  });
  expect(soldOutHeading).toBeInTheDocument();

  const soldOutTitle = getByRole(soldOutShow, "heading", {
    name: /The Joyous Nun Riot/i,
  });
  expect(soldOutTitle).toBeInTheDocument();

  const soldOutDesc = getByText(
    soldOutShow,
    "serious world music with an iconic musical saw"
  );
  expect(soldOutDesc).toBeInTheDocument();
});

test("redirect to the correct ticket detail page after clicking ticket button", async () => {
  const { history } = render(<Shows />);
  const ticketBtn = await screen.findByRole("button", { name: /ticket/i });
  userEvent.click(ticketBtn);
  expect(history.location.pathname).toBe("/tickets/0");
});
